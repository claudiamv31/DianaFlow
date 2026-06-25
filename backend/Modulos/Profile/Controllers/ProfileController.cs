using backend.Data;
using backend.Modulos.User.DTOs;
using backend.Modulos.User.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using backend.Modulos.Profile.Services;
using backend.Modulos.Profile.DTOs;

namespace backend.Modulos.Profile.Controllers
{
    [ApiController]
    [Route("api/profile")]
    [Authorize]
    public class ProfileController : ControllerBase
    {

        private readonly IProfileService _profileService;

        public ProfileController(IProfileService profileService)
        {
            _profileService = profileService;
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

            var profile = await _profileService.GetProfileByUserIdAsync(userId);
            if (profile == null)
                return NotFound(new { message = "User not found" });

            return Ok(new
            {
                id = profile.Id,
                name = profile.Name,
                lastName = profile.LastName,
                email = profile.User.Email,
                avatarUrl = profile.AvatarUrl,
                timeZone = profile.TimeZone,
                createdAt = profile.CreatedAt,
                updatedAt = profile.UpdatedAt
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

                var profile = await _profileService.GetProfileByUserIdAsync(userId);
                return Ok(new
                {
                    message = "Profile updated successfully",
                    data = new
                    {
                        id = profile!.Id,
                        name = profile.Name,
                        lastName = profile.LastName,
                        email = profile.User.Email,
                        avatarUrl = profile.AvatarUrl
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

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            return Guid.TryParse(userIdClaim, out var userId)
                ? userId
                : Guid.Empty;
        }   
    }
}
