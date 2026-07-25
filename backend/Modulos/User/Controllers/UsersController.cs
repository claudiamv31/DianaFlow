using Microsoft.AspNetCore.Authorization;
using backend.Modulos.User.DTOs;
using backend.Modulos.Profile.Services;
using Microsoft.AspNetCore.Mvc;
using System.Net.Mail;
using System.Security.Claims;
using backend.Api;

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
        private readonly IPasswordResetRateLimiter _passwordResetRateLimiter;

        public UsersController(
            IAuthService authService,
            IProfileService profileService,
            IWebHostEnvironment environment,
            IPasswordResetRateLimiter passwordResetRateLimiter)
        {
            _authService = authService;
            _profileService = profileService;
            _environment = environment;
            _passwordResetRateLimiter = passwordResetRateLimiter;
        }

        [HttpPost("sign-up")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var result = await _authService.RegisterAsync(dto);

            return result switch
            {
                RegistrationResult.Success => Ok(),
                RegistrationResult.WeakPassword => BadRequest(
                    new ApiError(ApiErrorCodes.PasswordWeak, "password")),
                _ => BadRequest(new ApiError(ApiErrorCodes.EmailAlreadyInUse, "email"))
            };
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var tokens = await _authService.Login(dto);
            
            if (tokens == null)
                return Unauthorized(new ApiError(ApiErrorCodes.InvalidCredentials, "password"));
            
            SetRefreshTokenCookie(tokens.RefreshToken);

            return Ok(new { accessToken = tokens.AccessToken });
        }

        [HttpPost("password-reset/request")]
        public async Task<IActionResult> RequestPasswordReset(PasswordResetRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest(new ApiError(ApiErrorCodes.EmailRequired, "email"));

            if (!IsValidEmail(dto.Email))
                return BadRequest(new ApiError(ApiErrorCodes.EmailInvalid, "email"));

            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            if (_passwordResetRateLimiter.TryAcquire(dto.Email, ipAddress))
            {
                await _authService.RequestPasswordResetAsync(dto.Email, dto.Locale);
            }

            return Ok();
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
        {
            var result = await _authService.ResetPasswordAsync(dto);

            return result switch
            {
                PasswordResetResult.Success => Ok(),
                PasswordResetResult.PasswordMismatch => BadRequest(
                    new ApiError(ApiErrorCodes.PasswordMismatch, "confirmPassword")),
                PasswordResetResult.WeakPassword => BadRequest(
                    new ApiError(ApiErrorCodes.PasswordWeak, "newPassword")),
                PasswordResetResult.PasswordReused => BadRequest(
                    new ApiError(ApiErrorCodes.PasswordReused, "newPassword")),
                _ => BadRequest(
                    new ApiError(ApiErrorCodes.PasswordResetTokenInvalid, "token"))
            };
        }

        [HttpPost("reset-password/validate")]
        public async Task<IActionResult> ValidatePasswordResetToken(
            ValidatePasswordResetTokenDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Token))
                return BadRequest(new ApiError(ApiErrorCodes.PasswordResetTokenInvalid, "token"));

            return await _authService.IsPasswordResetTokenValidAsync(dto.Token)
                ? Ok()
                : BadRequest(new ApiError(ApiErrorCodes.PasswordResetTokenInvalid, "token"));
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var userId = GetCurrentUserId();

            await _authService.LogoutAsync(userId);
            DeleteRefreshTokenCookie();

            return Ok();
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized(new ApiError(ApiErrorCodes.NotAuthorized));

            var profile = await _profileService.GetProfileByUserIdAsync(userId);
            if (profile == null)
                return NotFound(new ApiError(ApiErrorCodes.UserNotFound));

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

            if (userId == Guid.Empty)
                return Unauthorized(new ApiError(ApiErrorCodes.NotAuthorized));

            var result = await _authService.ChangePasswordAsync(
                userId,
                dto.CurrentPassword,
                dto.NewPassword);

            return result switch
            {
                PasswordChangeResult.Success => Ok(),
                PasswordChangeResult.CurrentPasswordIncorrect => BadRequest(
                    new ApiError(ApiErrorCodes.CurrentPasswordIncorrect, "currentPassword")),
                PasswordChangeResult.WeakPassword => BadRequest(
                    new ApiError(ApiErrorCodes.PasswordWeak, "newPassword")),
                PasswordChangeResult.PasswordReused => BadRequest(
                    new ApiError(ApiErrorCodes.PasswordReused, "newPassword")),
                _ => NotFound(new ApiError(ApiErrorCodes.UserNotFound))
            };
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            var refreshToken = Request.Cookies[RefreshTokenCookieName];

            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized(new ApiError(ApiErrorCodes.RefreshTokenMissing));

            var tokens = await _authService.RefreshTokenAsync(refreshToken);

            if (tokens == null)
            {
                DeleteRefreshTokenCookie();
                return Unauthorized(new ApiError(ApiErrorCodes.SessionExpired));
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

        private static bool IsValidEmail(string email)
        {
            try
            {
                var address = new MailAddress(email);
                return address.Address == email.Trim();
            }
            catch
            {
                return false;
            }
        }
    }
}
