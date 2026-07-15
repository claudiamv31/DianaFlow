using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using FluentAssertions;
using Xunit;
using backend.Modulos.Cycles.Controllers;
using backend.Modulos.Cycles.Services;
using backend.Modulos.Cycles.DTOs;
using backend.Modulos.Periods.DTOs;
using backend.Api;

namespace backend.Tests
{
    public class CalendarControllerTests
    {
        private readonly Mock<CalendarService> _mockCalendarService;
        private readonly Guid _testUserId;

        public CalendarControllerTests()
        {
            // CalendarService constructor takes (CycleService, PeriodService). We pass nulls since they are not used for mocked virtual methods.
            _mockCalendarService = new Mock<CalendarService>(null!, null!);
            _testUserId = Guid.NewGuid();
        }

        private CalendarController CreateController(string? userIdString = null)
        {
            var claims = new List<Claim>();
            if (userIdString != null)
            {
                claims.Add(new Claim("sub", userIdString));
            }

            var identity = new ClaimsIdentity(claims, "TestAuthType");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            var controller = new CalendarController(_mockCalendarService.Object)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext { User = claimsPrincipal }
                }
            };
            return controller;
        }

        #region GetCalendar (Monthly) Tests

        [Fact]
        public async Task GetCalendar_WithUnauthorizedUser_ReturnsUnauthorized()
        {
            // Arrange
            var controller = CreateController(userIdString: "not-a-valid-guid");

            // Act
            var result = await controller.GetCalendar(2026, 6);

            // Assert
            result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        [Fact]
        public async Task GetCalendar_WithNullResult_ReturnsNotFound()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            _mockCalendarService
                .Setup(s => s.GetCalendarAsync(_testUserId, 2026, 6))
                .ReturnsAsync((List<CalendarDayDto>)null!);

            // Act
            var result = await controller.GetCalendar(2026, 6);

            // Assert
            var notFoundResult = result.Should().BeOfType<NotFoundObjectResult>().Subject;
            notFoundResult.Value.ShouldHaveApiError(ApiErrorCodes.PeriodsNotFound);
        }

        [Fact]
        public async Task GetCalendar_WithValidData_ReturnsOk()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var expectedCalendar = new List<CalendarDayDto>
            {
                new CalendarDayDto { Date = new DateOnly(2026, 6, 1), CycleDay = 1, IsPeriod = true }
            };

            _mockCalendarService
                .Setup(s => s.GetCalendarAsync(_testUserId, 2026, 6))
                .ReturnsAsync(expectedCalendar);

            // Act
            var result = await controller.GetCalendar(2026, 6);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var returnedCalendar = okResult.Value.Should().BeAssignableTo<List<CalendarDayDto>>().Subject;
            returnedCalendar.Should().HaveCount(1);
            returnedCalendar[0].Date.Should().Be(new DateOnly(2026, 6, 1));
            returnedCalendar[0].CycleDay.Should().Be(1);
            returnedCalendar[0].IsPeriod.Should().BeTrue();
        }

        [Fact]
        public async Task GetCalendar_WhenServiceThrowsException_ReturnsInternalServerError()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var exceptionMessage = "Something went wrong";
            _mockCalendarService
                .Setup(s => s.GetCalendarAsync(_testUserId, 2026, 6))
                .ThrowsAsync(new Exception(exceptionMessage));

            // Act
            var result = await controller.GetCalendar(2026, 6);

            // Assert
            var objectResult = result.Should().BeOfType<ObjectResult>().Subject;
            objectResult.StatusCode.Should().Be(500);
            objectResult.Value.ShouldHaveApiError(ApiErrorCodes.InternalError);
        }

        #endregion

        #region GetCalendarDay (Single Day) Tests

        [Fact]
        public async Task GetCalendarDay_WithUnauthorizedUser_ReturnsUnauthorized()
        {
            // Arrange
            var controller = CreateController(userIdString: "invalid-guid");
            var testDate = new DateOnly(2026, 6, 24);

            // Act
            var result = await controller.GetCalendar(testDate);

            // Assert
            result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        [Fact]
        public async Task GetCalendarDay_WithValidData_ReturnsOk()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var testDate = new DateOnly(2026, 6, 24);
            var expectedDay = new CalendarDayDto
            {
                Date = testDate,
                CycleDay = 15,
                IsPeriod = false,
                IsFertile = true
            };

            _mockCalendarService
                .Setup(s => s.GetCalendarDayAsync(_testUserId, testDate))
                .ReturnsAsync(expectedDay);

            // Act
            var result = await controller.GetCalendar(testDate);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var returnedDay = okResult.Value.Should().BeOfType<CalendarDayDto>().Subject;
            returnedDay.Date.Should().Be(testDate);
            returnedDay.CycleDay.Should().Be(15);
            returnedDay.IsPeriod.Should().BeFalse();
            returnedDay.IsFertile.Should().BeTrue();
        }

        #endregion

        #region Upsert Tests

        [Fact]
        public async Task Upsert_WithUnauthorizedUser_ReturnsUnauthorized()
        {
            // Arrange
            var controller = CreateController(userIdString: null); // No claims principal
            var dto = new PeriodInputDto();

            // Act
            var result = await controller.Upsert(dto);

            // Assert
            result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        [Fact]
        public async Task Upsert_WhenResultIsCreated_ReturnsCreatedStatusCode()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var dto = new PeriodInputDto();

            _mockCalendarService
                .Setup(s => s.UpdateCalendar(_testUserId, dto))
                .ReturnsAsync("created");

            // Act
            var result = await controller.Upsert(dto);

            // Assert
            var objectResult = result.Should().BeOfType<ObjectResult>().Subject;
            objectResult.StatusCode.Should().Be(201);
            
            // Check that the returned anonymous object has the expected properties
            var responseValue = objectResult.Value;
            responseValue.Should().NotBeNull();
            
            var messageProp = responseValue.GetType().GetProperty("message");
            var statusProp = responseValue.GetType().GetProperty("status");
            
            messageProp.Should().NotBeNull();
            statusProp.Should().NotBeNull();
            
            messageProp!.GetValue(responseValue).Should().Be("Período creado");
            statusProp!.GetValue(responseValue).Should().Be("created");
        }

        [Fact]
        public async Task Upsert_WhenResultIsUpdated_ReturnsOk()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var dto = new PeriodInputDto();

            _mockCalendarService
                .Setup(s => s.UpdateCalendar(_testUserId, dto))
                .ReturnsAsync("updated");

            // Act
            var result = await controller.Upsert(dto);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var responseValue = okResult.Value;
            responseValue.Should().NotBeNull();

            var messageProp = responseValue.GetType().GetProperty("message");
            var statusProp = responseValue.GetType().GetProperty("status");

            messageProp.Should().NotBeNull();
            statusProp.Should().NotBeNull();

            messageProp!.GetValue(responseValue).Should().Be("Período actualizado");
            statusProp!.GetValue(responseValue).Should().Be("updated");
        }

        [Fact]
        public async Task Upsert_WhenServiceThrowsException_ReturnsInternalServerError()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var dto = new PeriodInputDto();
            var exceptionMessage = "Database deadlock or validation failure";

            _mockCalendarService
                .Setup(s => s.UpdateCalendar(_testUserId, dto))
                .ThrowsAsync(new Exception(exceptionMessage));

            // Act
            var result = await controller.Upsert(dto);

            // Assert
            var objectResult = result.Should().BeOfType<ObjectResult>().Subject;
            objectResult.StatusCode.Should().Be(500);
            objectResult.Value.ShouldHaveApiError(ApiErrorCodes.CalendarUpdateFailed);
        }

        #endregion
    }
}
