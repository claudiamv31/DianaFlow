using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using backend.Modulos.Profile.Services;
using backend.Modulos.User.Controllers;
using backend.Modulos.User.DTOs;
using backend.Modulos.User.Models;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace backend.Tests
{
    public class UsersControllerTests
    {
        private readonly Mock<IAuthService> _authService;
        private readonly Mock<IProfileService> _profileService;
        private readonly Guid _userId;

        public UsersControllerTests()
        {
            _authService = new Mock<IAuthService>();
            _profileService = new Mock<IProfileService>();
            _userId = Guid.NewGuid();
        }

        private UsersController CreateController(string? userIdString = null)
        {
            var claims = new List<Claim>();
            if (userIdString != null)
            {
                claims.Add(new Claim("sub", userIdString));
            }

            return new UsersController(_authService.Object, _profileService.Object)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext
                    {
                        User = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuthType"))
                    }
                }
            };
        }

        [Fact]
        public async Task Login_WithValidCredentials_ReturnsJwtString()
        {
            var dto = new LoginDto
            {
                Email = "jane@example.com",
                Password = "correct-password"
            };
            _authService.Setup(s => s.Login(dto)).ReturnsAsync(new AuthTokensDto
            {
                AccessToken = "jwt-token",
                RefreshToken = "refresh-token"
            });
            var controller = CreateController();

            var result = await controller.Login(dto);

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var token = okResult.Value!.GetType().GetProperty("token")!.GetValue(okResult.Value);
            var refreshToken = okResult.Value!.GetType().GetProperty("refreshToken")!.GetValue(okResult.Value);
            token.Should().Be("jwt-token");
            refreshToken.Should().Be("refresh-token");
        }

        [Fact]
        public async Task Login_WithInvalidCredentials_ReturnsUnauthorized()
        {
            var dto = new LoginDto
            {
                Email = "jane@example.com",
                Password = "wrong-password"
            };
            _authService.Setup(s => s.Login(dto)).ReturnsAsync((AuthTokensDto?)null);
            var controller = CreateController();

            var result = await controller.Login(dto);

            result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        [Fact]
        public async Task GetCurrentUser_WithProfile_ReturnsUserAndProfileData()
        {
            var profileId = Guid.NewGuid();
            var profile = new backend.Modulos.Profile.Models.Profile
            {
                Id = profileId,
                UserId = _userId,
                Name = "Jane",
                LastName = "Doe",
                TimeZone = "America/Mazatlan",
                AvatarUrl = "/uploads/avatars/jane.png",
                User = new User
                {
                    Id = _userId,
                    Email = "jane@example.com"
                }
            };
            _profileService
                .Setup(s => s.GetProfileByUserIdAsync(_userId))
                .ReturnsAsync(profile);
            var controller = CreateController(_userId.ToString());

            var result = await controller.GetCurrentUser();

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
            var response = okResult.Value!;
            response.GetType().GetProperty("id")!.GetValue(response).Should().Be(_userId);
            response.GetType().GetProperty("profileId")!.GetValue(response).Should().Be(profileId);
            response.GetType().GetProperty("email")!.GetValue(response).Should().Be("jane@example.com");
            response.GetType().GetProperty("name")!.GetValue(response).Should().Be("Jane");
        }

        [Fact]
        public async Task GetCurrentUser_WithInvalidClaim_ReturnsUnauthorized()
        {
            var controller = CreateController("not-a-guid");

            var result = await controller.GetCurrentUser();

            result.Should().BeOfType<UnauthorizedObjectResult>();
        }

        [Fact]
        public async Task GetCurrentUser_WithoutProfile_ReturnsNotFound()
        {
            _profileService
                .Setup(s => s.GetProfileByUserIdAsync(_userId))
                .ReturnsAsync((backend.Modulos.Profile.Models.Profile?)null);
            var controller = CreateController(_userId.ToString());

            var result = await controller.GetCurrentUser();

            result.Should().BeOfType<NotFoundObjectResult>();
        }
    }
}
