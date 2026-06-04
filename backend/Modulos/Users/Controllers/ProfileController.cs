using backend.Data;
using backend.Modulos.Users.DTOs;
using backend.Modulos.Users.Models;
using backend.Modulos.Users.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Modulos.Users.Controllers
{
    [ApiController]
    [Route("api/profile")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly IProfileService _profileService;
        private readonly AppDbContext _context;

        public ProfileController(IProfileService profileService, AppDbContext context)
        {
            _profileService = profileService;
            _context = context;
        }

        /// <summary>
        /// Get current user's profile information
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized(new { message = "Not authorized" });

            var user = await _profileService.GetUserByIdAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(new
            {
                id = user.Id,
                name = user.Name,
                lastName = user.LastName,
                email = user.Email,
                avatarUrl = user.AvatarUrl,
                timeZone = user.TimeZone,
                createdAt = user.CreatedAt,
                updatedAt = user.UpdatedAt
            });
        }

        /// <summary>
        /// Update user's profile details (name, lastName, email)
        /// </summary>
        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized(new { message = "Not authorized" });

            // Validate input
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "The name is required" });

            if (string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest(new { message = "The email is required" });

            if (!IsValidEmail(dto.Email))
                return BadRequest(new { message = "The email format is invalid" });

            try
            {
                await _profileService.UpdateProfileAsync(userId, dto.Name, dto.LastName, dto.Email, dto.AvatarUrl);

                var user = await _profileService.GetUserByIdAsync(userId);
                return Ok(new
                {
                    message = "Profile updated successfully",
                    data = new
                    {
                        id = user!.Id,
                        name = user.Name,
                        lastName = user.LastName,
                        email = user.Email,
                        avatarUrl = user.AvatarUrl
                    }
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating profile", error = ex.Message });
            }
        }

        /// <summary>
        /// Upload user's avatar image
        /// </summary>
        [HttpPost("upload-avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile? file)
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized(new { message = "Not authorized" });

            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Please select an image" });

            try
            {
                var avatarUrl = await _profileService.SaveAvatarAsync(file, userId);

                return Ok(new AvatarResponseDto
                {
                    AvatarUrl = avatarUrl,
                    Message = "Avatar uploaded successfully"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error uploading avatar", error = ex.Message });
            }
        }

        /// <summary>
        /// Change user's password
        /// </summary>
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == Guid.Empty)
                return Unauthorized(new { message = "Not authorized" });

            // Validate input
            if (string.IsNullOrWhiteSpace(dto.CurrentPassword))
                return BadRequest(new { message = "The current password is required" });

            if (string.IsNullOrWhiteSpace(dto.NewPassword))
                return BadRequest(new { message = "The new password is required" });

            if (dto.NewPassword.Length < 8)
                return BadRequest(new { message = "The new password must be at least 8 characters long" });

            if (dto.CurrentPassword == dto.NewPassword)
                return BadRequest(new { message = "The new password must be different from the current password" });

            try
            {
                await _profileService.ChangePasswordAsync(userId, dto.CurrentPassword, dto.NewPassword);

                return Ok(new { message = "Password updated successfully" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error changing password", error = ex.Message });
            }
        }

        /// <summary>
        /// Helper method to extract user ID from JWT claims
        /// </summary>
        private Guid GetCurrentUserId()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(userIdString, out var userId))
                return userId;

            return Guid.Empty;
        }

        /// <summary>
        /// Simple email validation
        /// </summary>
        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }
    }
}
