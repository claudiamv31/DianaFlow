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
        private readonly IAuthService _authService;
        private readonly IProfileService _profileService;

        public UsersController(IAuthService authService, IProfileService profileService)
        {
            _authService = authService;
            _profileService = profileService;
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
            var refreshToken = Request.Cookies["refreshToken"];

            var oldAccessToken = HttpContext.Request.Headers["Authorization"]
                                        .FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(refreshToken) || string.IsNullOrEmpty(oldAccessToken))
                return Unauthorized(new { message = "Tokens missing" });

            var tokens = await _authService.RefreshTokenAsync(oldAccessToken, refreshToken);

            if (tokens == null)
                return Unauthorized(new { message = "Invalid or expired session" });

            SetRefreshTokenCookie(tokens.RefreshToken);

            return Ok(new { accessToken = tokens.AccessToken });
        }


        private static object ToAuthResponse(AuthTokensDto tokens)
        {
            return new
            {
                accessToken = tokens.AccessToken,
                refreshToken = tokens.RefreshToken
            };
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
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,  // Hides cookie from JavaScript
                Secure = true,    // Requires HTTPS (Set to false ONLY if testing locally without HTTPS)
                SameSite = SameSiteMode.Strict, // Prevents CSRF attacks
                Expires = DateTime.UtcNow.AddDays(7)
            };
            Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
        }
    }
}
