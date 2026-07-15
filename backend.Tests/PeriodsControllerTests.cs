using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using FluentAssertions;
using Xunit;
using backend.Modulos.Periods.Controllers;
using backend.Modulos.Periods.Services;
using backend.Modulos.Periods.DTOs;
using backend.Modulos.Periods.Models;
using backend.Modulos.Cycles.DTOs;
using backend.Modulos.Cycles.Enums;
using backend.Api;

namespace backend.Tests
{
    public class PeriodsControllerTests
    {
        private readonly Mock<PeriodService> _mockPeriodService;
        private readonly Guid _testUserId;

        public PeriodsControllerTests()
        {
            // Since we're mocking PeriodService (which now has virtual methods),
            // and its constructor takes dependencies, we pass nulls as we don't need them for mocked methods.
            _mockPeriodService = new Mock<PeriodService>(null!, null!, null!);
            _testUserId = Guid.NewGuid();
        }

        private PeriodsController CreateController(string? userIdString = null)
        {
            var claims = new List<Claim>();
            if (userIdString != null)
            {
                claims.Add(new Claim("sub", userIdString));
            }

            var identity = new ClaimsIdentity(claims, "TestAuthType");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            var controller = new PeriodsController(_mockPeriodService.Object)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext { User = claimsPrincipal }
                }
            };
            return controller;
        }

        #region CreatePeriod Tests

        [Fact]
        public async Task CreatePeriod_WithUnauthorizedUser_ReturnsUnauthorized()
        {
            // Arrange
            var controller = CreateController(userIdString: "not-a-valid-guid");
            var dto = new PeriodInputDto();

            // Act
            var result = await controller.CreatePeriod(dto);

            // Assert
            result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        [Fact]
        public async Task CreatePeriod_WithNullSelectedDays_ReturnsBadRequest()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var dto = new PeriodInputDto { SelectedDays = null! };

            // Act
            var result = await controller.CreatePeriod(dto);

            // Assert
            var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequestResult.Value.ShouldHaveApiError(ApiErrorCodes.PeriodDaysRequired, "selectedDays");
        }

        [Fact]
        public async Task CreatePeriod_WithEmptySelectedDays_ReturnsBadRequest()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var dto = new PeriodInputDto { SelectedDays = new List<DailyRecordInput>() };

            // Act
            var result = await controller.CreatePeriod(dto);

            // Assert
            var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequestResult.Value.ShouldHaveApiError(ApiErrorCodes.PeriodDaysRequired, "selectedDays");
        }

        [Fact]
        public async Task CreatePeriod_WithDefaultStartDate_ReturnsBadRequest()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var dto = new PeriodInputDto
            {
                SelectedDays = new List<DailyRecordInput>
                {
                    new DailyRecordInput { Date = default, Flow = 1 }
                }
            };

            // Act
            var result = await controller.CreatePeriod(dto);

            // Assert
            var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequestResult.Value.ShouldHaveApiError(ApiErrorCodes.PeriodStartRequired, "startDate");
        }

        [Fact(Skip = "Sorting of SelectedDays in the controller prevents endDate < startDate from ever occurring")]
        public async Task CreatePeriod_WithEndDateLessThanStartDate_ReturnsBadRequest()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var dto = new PeriodInputDto
            {
                SelectedDays = new List<DailyRecordInput>
                {
                    new DailyRecordInput { Date = new DateOnly(2026, 6, 10), Flow = 1 },
                    new DailyRecordInput { Date = new DateOnly(2026, 6, 5), Flow = 1 }
                }
            };

            // Act
            var result = await controller.CreatePeriod(dto);

            // Assert
            var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequestResult.Value.ShouldHaveApiError(ApiErrorCodes.PeriodStartRequired, "endDate");
        }

        [Fact]
        public async Task CreatePeriod_WithValidData_ReturnsCreated()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var dto = new PeriodInputDto
            {
                SelectedDays = new List<DailyRecordInput>
                {
                    new DailyRecordInput { Date = new DateOnly(2026, 6, 1), Flow = 2 },
                    new DailyRecordInput { Date = new DateOnly(2026, 6, 2), Flow = 3 }
                }
            };

            _mockPeriodService
                .Setup(s => s.AddPeriodAsync(_testUserId, dto))
                .Returns(Task.CompletedTask);

            // Act
            var result = await controller.CreatePeriod(dto);

            // Assert
            var createdResult = result.Should().BeOfType<CreatedResult>().Subject;
            createdResult.Location.Should().Be("");
            createdResult.Value.Should().NotBeNull();
            
            _mockPeriodService.Verify(s => s.AddPeriodAsync(_testUserId, dto), Times.Once);
        }

        [Fact]
        public async Task CreatePeriod_WhenServiceThrows_ReturnsInternalServerError()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var dto = new PeriodInputDto
            {
                SelectedDays = new List<DailyRecordInput>
                {
                    new DailyRecordInput { Date = new DateOnly(2026, 6, 1), Flow = 2 }
                }
            };

            _mockPeriodService
                .Setup(s => s.AddPeriodAsync(_testUserId, dto))
                .ThrowsAsync(new Exception("Database error"));

            // Act
            var result = await controller.CreatePeriod(dto);

            // Assert
            var statusCodeResult = result.Should().BeOfType<ObjectResult>().Subject;
            statusCodeResult.StatusCode.Should().Be(500);
            statusCodeResult.Value.ShouldHaveApiError(ApiErrorCodes.InternalError);
        }

        #endregion

        #region GetPeriods Tests

        [Fact]
        public async Task GetPeriods_WithUnauthorizedUser_ReturnsUnauthorized()
        {
            // Arrange
            var controller = CreateController(userIdString: null);

            // Act
            var result = await controller.GetPeriods(null, null);

            // Assert
            result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        [Fact]
        public async Task GetPeriods_WithYearAndMonth_ReturnsOkWithPeriodsByMonth()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var year = 2026;
            var month = 6;
            var expectedPeriods = new List<PeriodDto>
            {
                new PeriodDto { Id = "1", StartDate = new DateOnly(2026, 6, 1), EndDate = new DateOnly(2026, 6, 5), IsActive = false }
            };

            _mockPeriodService
                .Setup(s => s.GetPeriodsByMonthAsync(_testUserId, year, month))
                .ReturnsAsync(expectedPeriods);

            // Act
            var result = await controller.GetPeriods(year, month);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().BeEquivalentTo(expectedPeriods);
            
            _mockPeriodService.Verify(s => s.GetPeriodsByMonthAsync(_testUserId, year, month), Times.Once);
        }

        [Fact]
        public async Task GetPeriods_WithYearOnly_ReturnsOkWithPeriodsByYear()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var year = 2026;
            var expectedPeriods = new List<PeriodDto>
            {
                new PeriodDto { Id = "1", StartDate = new DateOnly(2026, 6, 1), EndDate = new DateOnly(2026, 6, 5), IsActive = false }
            };

            _mockPeriodService
                .Setup(s => s.GetPeriodsByYearAsync(_testUserId, year))
                .ReturnsAsync(expectedPeriods);

            // Act
            var result = await controller.GetPeriods(year, null);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().BeEquivalentTo(expectedPeriods);
            
            _mockPeriodService.Verify(s => s.GetPeriodsByYearAsync(_testUserId, year), Times.Once);
        }

        [Fact]
        public async Task GetPeriods_WithNoFilters_ReturnsOkWithPaginatedPeriods()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var page = 1;
            var pageSize = 5;
            var expectedPeriods = new List<PeriodDto>
            {
                new PeriodDto { Id = "1", StartDate = new DateOnly(2026, 6, 1), EndDate = new DateOnly(2026, 6, 5), IsActive = false }
            };

            _mockPeriodService
                .Setup(s => s.GetPeriodsPagination(_testUserId, page, pageSize))
                .ReturnsAsync(expectedPeriods);

            // Act
            var result = await controller.GetPeriods(null, null, page, pageSize);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().BeEquivalentTo(expectedPeriods);
            
            _mockPeriodService.Verify(s => s.GetPeriodsPagination(_testUserId, page, pageSize), Times.Once);
        }

        [Fact]
        public async Task GetPeriods_WhenServiceThrows_ReturnsInternalServerError()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());

            _mockPeriodService
                .Setup(s => s.GetPeriodsPagination(_testUserId, 1, 5))
                .ThrowsAsync(new Exception("Database connection failed"));

            // Act
            var result = await controller.GetPeriods(null, null);

            // Assert
            var statusCodeResult = result.Should().BeOfType<ObjectResult>().Subject;
            statusCodeResult.StatusCode.Should().Be(500);
            statusCodeResult.Value.ShouldHaveApiError(ApiErrorCodes.InternalError);
        }

        #endregion

        #region GetLatestPeriod Tests

        [Fact]
        public async Task GetLatestPeriod_WithUnauthorizedUser_ReturnsUnauthorized()
        {
            // Arrange
            var controller = CreateController(userIdString: "");

            // Act
            var result = await controller.GetLatestPeriod();

            // Assert
            result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        [Fact]
        public async Task GetLatestPeriod_WhenNoPeriodFound_ReturnsNotFound()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            
            _mockPeriodService
                .Setup(s => s.GetLatestPeriodAsync(_testUserId))
                .ReturnsAsync((PeriodDto?)null);

            // Act
            var result = await controller.GetLatestPeriod();

            // Assert
            var notFoundResult = result.Should().BeOfType<NotFoundObjectResult>().Subject;
            notFoundResult.Value.ShouldHaveApiError(ApiErrorCodes.PeriodsNotFound);
        }

        [Fact]
        public async Task GetLatestPeriod_WhenPeriodFound_ReturnsOk()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var expectedPeriod = new PeriodDto { Id = "5", StartDate = new DateOnly(2026, 6, 1) };

            _mockPeriodService
                .Setup(s => s.GetLatestPeriodAsync(_testUserId))
                .ReturnsAsync(expectedPeriod);

            // Act
            var result = await controller.GetLatestPeriod();

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().BeEquivalentTo(expectedPeriod);
        }

        [Fact]
        public async Task GetLatestPeriod_WhenServiceThrows_ReturnsInternalServerError()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());

            _mockPeriodService
                .Setup(s => s.GetLatestPeriodAsync(_testUserId))
                .ThrowsAsync(new Exception("Fail"));

            // Act
            var result = await controller.GetLatestPeriod();

            // Assert
            var statusCodeResult = result.Should().BeOfType<ObjectResult>().Subject;
            statusCodeResult.StatusCode.Should().Be(500);
        }

        #endregion

        #region GetNextPeriod Tests

        [Fact]
        public async Task GetNextPeriod_WithUnauthorizedUser_ReturnsUnauthorized()
        {
            // Arrange
            var controller = CreateController(userIdString: "invalid");

            // Act
            var result = await controller.GetNextPeriod();

            // Assert
            result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        [Fact]
        public async Task GetNextPeriod_WhenNoPredictionFound_ReturnsNotFound()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());

            _mockPeriodService
                .Setup(s => s.GetNextPeriodPredictionAsync(_testUserId))
                .ReturnsAsync((PeriodPredictionDto?)null);

            // Act
            var result = await controller.GetNextPeriod();

            // Assert
            var notFoundResult = result.Should().BeOfType<NotFoundObjectResult>().Subject;
            notFoundResult.Value.ShouldHaveApiError(ApiErrorCodes.PeriodNotFound);
        }

        [Fact]
        public async Task GetNextPeriod_WhenPredictionFound_ReturnsOk()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var expectedPrediction = new PeriodPredictionDto
            {
                StartDate = new DateOnly(2026, 7, 1),
                EndDate = new DateOnly(2026, 7, 5)
            };

            _mockPeriodService
                .Setup(s => s.GetNextPeriodPredictionAsync(_testUserId))
                .ReturnsAsync(expectedPrediction);

            // Act
            var result = await controller.GetNextPeriod();

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().BeEquivalentTo(expectedPrediction);
        }

        [Fact]
        public async Task GetNextPeriod_WhenServiceThrows_ReturnsInternalServerError()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());

            _mockPeriodService
                .Setup(s => s.GetNextPeriodPredictionAsync(_testUserId))
                .ThrowsAsync(new Exception("Prediction engine error"));

            // Act
            var result = await controller.GetNextPeriod();

            // Assert
            var statusCodeResult = result.Should().BeOfType<ObjectResult>().Subject;
            statusCodeResult.StatusCode.Should().Be(500);
        }

        #endregion

        #region GetHome Tests

        [Fact]
        public async Task GetHome_WithUnauthorizedUser_ReturnsUnauthorized()
        {
            // Arrange
            var controller = CreateController(userIdString: "bad-guid");

            // Act
            var result = await controller.GetHome();

            // Assert
            result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        [Fact]
        public async Task GetHome_WithValidUser_ReturnsOkWithHomeData()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var expectedHomeDto = new PeriodHomeDto
            {
                PeriodId = 12,
                StartDate = new DateOnly(2026, 6, 1),
                IsActive = true,
                CurrentPhase = "menstruation"
            };

            _mockPeriodService
                .Setup(s => s.GetLatestForHomeAsync(_testUserId))
                .ReturnsAsync(expectedHomeDto);

            // Act
            var result = await controller.GetHome();

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().BeEquivalentTo(expectedHomeDto);
        }

        #endregion

        #region UpdatePeriod Tests

        [Fact]
        public async Task UpdatePeriod_WithNullPeriodId_ReturnsBadRequest()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var dto = new PeriodInputDto { PeriodId = null };

            // Act
            var result = await controller.UpdatePeriod(dto);

            // Assert
            var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequestResult.Value.ShouldHaveApiError(ApiErrorCodes.PeriodIdRequired, "periodId");
        }

        [Fact]
        public async Task UpdatePeriod_WithUnauthorizedUser_ReturnsUnauthorized()
        {
            // Arrange
            var controller = CreateController(userIdString: null);
            var dto = new PeriodInputDto { PeriodId = 1 };

            // Act
            var result = await controller.UpdatePeriod(dto);

            // Assert
            result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        [Fact]
        public async Task UpdatePeriod_WhenPeriodNotFound_ReturnsNotFound()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var dto = new PeriodInputDto { PeriodId = 99 };

            _mockPeriodService
                .Setup(s => s.UpdatePeriod(_testUserId, dto))
                .ReturnsAsync(false);

            // Act
            var result = await controller.UpdatePeriod(dto);

            // Assert
            var notFoundResult = result.Should().BeOfType<NotFoundObjectResult>().Subject;
            notFoundResult.Value.ShouldHaveApiError(ApiErrorCodes.PeriodNotFound);
        }

        [Fact]
        public async Task UpdatePeriod_WhenSuccessful_ReturnsOkWithDto()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var dto = new PeriodInputDto { PeriodId = 1, SelectedDays = new List<DailyRecordInput>() };

            _mockPeriodService
                .Setup(s => s.UpdatePeriod(_testUserId, dto))
                .ReturnsAsync(true);

            // Act
            var result = await controller.UpdatePeriod(dto);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().BeEquivalentTo(dto);
        }

        [Fact]
        public async Task UpdatePeriod_WhenServiceThrows_ReturnsInternalServerError()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var dto = new PeriodInputDto { PeriodId = 1 };

            _mockPeriodService
                .Setup(s => s.UpdatePeriod(_testUserId, dto))
                .ThrowsAsync(new Exception("DB Conflict"));

            // Act
            var result = await controller.UpdatePeriod(dto);

            // Assert
            var statusCodeResult = result.Should().BeOfType<ObjectResult>().Subject;
            statusCodeResult.StatusCode.Should().Be(500);
            statusCodeResult.Value.ShouldHaveApiError(ApiErrorCodes.InternalError);
        }

        #endregion

        #region UpdatePeriodDay Tests

        [Fact]
        public async Task UpdatePeriodDay_WithDefaultDate_ReturnsBadRequest()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var dto = new DailyRecordInput { Date = default, Flow = 1 };

            // Act
            var result = await controller.UpdatePeriodDay(dto);

            // Assert
            var badRequestResult = result.Should().BeOfType<BadRequestObjectResult>().Subject;
            badRequestResult.Value.ShouldHaveApiError(ApiErrorCodes.DateRequired, "date");
        }

        [Fact]
        public async Task UpdatePeriodDay_WithUnauthorizedUser_ReturnsUnauthorized()
        {
            // Arrange
            var controller = CreateController(userIdString: null);
            var dto = new DailyRecordInput { Date = new DateOnly(2026, 6, 1), Flow = 1 };

            // Act
            var result = await controller.UpdatePeriodDay(dto);

            // Assert
            result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        [Fact]
        public async Task UpdatePeriodDay_WhenUpdateFails_ReturnsInternalServerError()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var dto = new DailyRecordInput { Date = new DateOnly(2026, 6, 1), Flow = 1 };

            _mockPeriodService
                .Setup(s => s.UpdatePeriodDayAsync(_testUserId, dto))
                .ReturnsAsync(false);

            // Act
            var result = await controller.UpdatePeriodDay(dto);

            // Assert
            var statusCodeResult = result.Should().BeOfType<ObjectResult>().Subject;
            statusCodeResult.StatusCode.Should().Be(500);
            statusCodeResult.Value.ShouldHaveApiError(ApiErrorCodes.PeriodUpdateFailed);
        }

        [Fact]
        public async Task UpdatePeriodDay_WhenSuccessful_ReturnsOk()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var dto = new DailyRecordInput { Date = new DateOnly(2026, 6, 1), Flow = 1 };

            _mockPeriodService
                .Setup(s => s.UpdatePeriodDayAsync(_testUserId, dto))
                .ReturnsAsync(true);

            // Act
            var result = await controller.UpdatePeriodDay(dto);

            // Assert
            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            okResult.Value.Should().NotBeNull();
            
            // Checking structure of response object
            var dataProp = okResult.Value!.GetType().GetProperty("data");
            var messageProp = okResult.Value!.GetType().GetProperty("message");

            messageProp.Should().NotBeNull();
            messageProp!.GetValue(okResult.Value).Should().Be("Daily log updated successfully");

            dataProp.Should().NotBeNull();
            dataProp!.GetValue(okResult.Value).Should().BeEquivalentTo(dto);
        }

        [Fact]
        public async Task UpdatePeriodDay_WhenServiceThrows_ReturnsInternalServerError()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var dto = new DailyRecordInput { Date = new DateOnly(2026, 6, 1), Flow = 1 };

            _mockPeriodService
                .Setup(s => s.UpdatePeriodDayAsync(_testUserId, dto))
                .ThrowsAsync(new Exception("Lock failure"));

            // Act
            var result = await controller.UpdatePeriodDay(dto);

            // Assert
            var statusCodeResult = result.Should().BeOfType<ObjectResult>().Subject;
            statusCodeResult.StatusCode.Should().Be(500);
            statusCodeResult.Value.ShouldHaveApiError(ApiErrorCodes.InternalError);
        }

        #endregion

        #region DeletePeriod Tests

        [Fact]
        public async Task DeletePeriod_WithUnauthorizedUser_ReturnsUnauthorized()
        {
            // Arrange
            var controller = CreateController(userIdString: "invalid-user");
            var id = "123";

            // Act
            var result = await controller.DeletePeriod(id);

            // Assert
            result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        [Fact]
        public async Task DeletePeriod_WhenPeriodNotFound_ReturnsNotFound()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var id = "123";

            _mockPeriodService
                .Setup(s => s.DeletePeriodAsync(_testUserId, id))
                .ReturnsAsync(false);

            // Act
            var result = await controller.DeletePeriod(id);

            // Assert
            var notFoundResult = result.Should().BeOfType<NotFoundObjectResult>().Subject;
            notFoundResult.Value.ShouldHaveApiError(ApiErrorCodes.PeriodNotFound);
        }

        [Fact]
        public async Task DeletePeriod_WhenSuccessful_ReturnsNoContent()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var id = "123";

            _mockPeriodService
                .Setup(s => s.DeletePeriodAsync(_testUserId, id))
                .ReturnsAsync(true);

            // Act
            var result = await controller.DeletePeriod(id);

            // Assert
            result.Should().BeOfType<NoContentResult>();
        }

        [Fact]
        public async Task DeletePeriod_WhenServiceThrows_ReturnsInternalServerError()
        {
            // Arrange
            var controller = CreateController(_testUserId.ToString());
            var id = "123";

            _mockPeriodService
                .Setup(s => s.DeletePeriodAsync(_testUserId, id))
                .ThrowsAsync(new Exception("DB connection dropped"));

            // Act
            var result = await controller.DeletePeriod(id);

            // Assert
            var statusCodeResult = result.Should().BeOfType<ObjectResult>().Subject;
            statusCodeResult.StatusCode.Should().Be(500);
            statusCodeResult.Value.ShouldHaveApiError(ApiErrorCodes.InternalError);
        }

        #endregion
    }
}
