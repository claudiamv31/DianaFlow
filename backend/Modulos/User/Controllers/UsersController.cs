using Microsoft.AspNetCore.Authorization;
using backend.Modulos.User.DTOs;
using backend.Modulos.Profile.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Modulos.User.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private const string RefreshTokenCookieName = "refreshToken";

        private readonly IAuthService _authService;
        private readonly IProfileService _profileService;
        private readonly IWebHostEnvironment _environment;

        public UsersController(
            IAuthService authService,
            IProfileService profileService,
            IWebHostEnvironment environment)
        {
            _authService = authService;
            _profileService = profileService;
            _environment = environment;
        }

        [HttpPost("sign-up")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var errorMessage = await _authService.RegisterAsync(dto);
            
            if (errorMessage != null)
                return BadRequest(new { message = errorMessage });

            return Ok(new { message = "User registered successfully" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var tokens = await _authService.Login(dto);
            
            if (tokens == null)
                return Unauthorized(new { message = "Invalid email or password." });
            
            SetRefreshTokenCookie(tokens.RefreshToken);

            return Ok(new { accessToken = tokens.AccessToken });
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var userId = GetCurrentUserId();

            await _authService.LogoutAsync(userId);
            DeleteRefreshTokenCookie();

            return Ok(new { message = "User logged out successfully" });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized(new { message = "Not authorized" });

            var profile = await _profileService.GetProfileByUserIdAsync(userId);
            if (profile == null)
                return NotFound(new { message = "User not found" });

            return Ok(new
            {
                id = userId,
                profileId = profile.Id,
                email = profile.User.Email,
                name = profile.Name,
                lastName = profile.LastName,
                avatarUrl = profile.AvatarUrl,
                timeZone = profile.TimeZone
            });
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword(
            [FromBody] ChangePasswordDto dto)
        {
            var userId = GetCurrentUserId();

            await _authService.ChangePasswordAsync(
                userId,
                dto.CurrentPassword,
                dto.NewPassword);

            return Ok(new
            {
                message = "Password updated successfully"
            });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            var refreshToken = Request.Cookies[RefreshTokenCookieName];

            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized(new { message = "Refresh token missing" });

            var tokens = await _authService.RefreshTokenAsync(refreshToken);

            if (tokens == null)
            {
                DeleteRefreshTokenCookie();
                return Unauthorized(new { message = "Invalid or expired session" });
            }

            SetRefreshTokenCookie(tokens.RefreshToken);

            return Ok(new { accessToken = tokens.AccessToken });
        }


        private Guid GetCurrentUserId()
        {
            var userIdString = User.FindFirst("sub")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (Guid.TryParse(userIdString, out var userId))
                return userId;

            return Guid.Empty;
        }

        private void SetRefreshTokenCookie(string refreshToken)
        {
            var cookieOptions = BuildRefreshTokenCookieOptions();
            cookieOptions.Expires = DateTimeOffset.UtcNow.AddDays(7);

            Response.Cookies.Append(RefreshTokenCookieName, refreshToken, cookieOptions);
        }

        private void DeleteRefreshTokenCookie()
        {
            Response.Cookies.Delete(RefreshTokenCookieName, BuildRefreshTokenCookieOptions());
        }

        private CookieOptions BuildRefreshTokenCookieOptions()
        {
            var isDevelopment = _environment.IsDevelopment();

            return new CookieOptions
            {
                HttpOnly = true,
                Secure = !isDevelopment,
                SameSite = isDevelopment ? SameSiteMode.Lax : SameSiteMode.None,
                Path = "/api/users"
            };
        }
    }
}
