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
                return Unauthorized(new { message = "No autorizado" });

            var user = await _profileService.GetUserByIdAsync(userId);
            if (user == null)
                return NotFound(new { message = "Usuario no encontrado" });

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
                return Unauthorized(new { message = "No autorizado" });

            // Validate input
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "El nombre es requerido" });

            if (string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest(new { message = "El correo es requerido" });

            if (!IsValidEmail(dto.Email))
                return BadRequest(new { message = "El formato del correo no es válido" });

            try
            {
                await _profileService.UpdateProfileAsync(userId, dto.Name, dto.LastName, dto.Email);

                var user = await _profileService.GetUserByIdAsync(userId);
                return Ok(new
                {
                    message = "Perfil actualizado correctamente",
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
                return StatusCode(500, new { message = "Error al actualizar el perfil", error = ex.Message });
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
                return Unauthorized(new { message = "No autorizado" });

            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Por favor selecciona una imagen" });

            try
            {
                var avatarUrl = await _profileService.SaveAvatarAsync(file, userId);

                return Ok(new AvatarResponseDto
                {
                    AvatarUrl = avatarUrl,
                    Message = "Avatar subido correctamente"
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
                return StatusCode(500, new { message = "Error al subir el avatar", error = ex.Message });
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
                return Unauthorized(new { message = "No autorizado" });

            // Validate input
            if (string.IsNullOrWhiteSpace(dto.CurrentPassword))
                return BadRequest(new { message = "La contraseña actual es requerida" });

            if (string.IsNullOrWhiteSpace(dto.NewPassword))
                return BadRequest(new { message = "La nueva contraseña es requerida" });

            if (dto.NewPassword.Length < 8)
                return BadRequest(new { message = "La nueva contraseña debe tener al menos 8 caracteres" });

            if (dto.CurrentPassword == dto.NewPassword)
                return BadRequest(new { message = "La nueva contraseña debe ser diferente a la actual" });

            try
            {
                await _profileService.ChangePasswordAsync(userId, dto.CurrentPassword, dto.NewPassword);

                return Ok(new { message = "Contraseña actualizada correctamente" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al cambiar la contraseña", error = ex.Message });
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
