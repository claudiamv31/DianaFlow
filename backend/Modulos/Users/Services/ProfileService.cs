using backend.Data;
using backend.Modulos.Users.Models;

namespace backend.Modulos.Users.Services
{
    public interface IPasswordService
    {
        string HashPassword(string password);
        bool VerifyPassword(string password, string hash);
    }

    public class PasswordService : IPasswordService
    {
        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public bool VerifyPassword(string password, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
    }

    public interface IProfileService
    {
        Task<UserProfile?> GetUserByIdAsync(Guid userId);
        Task<bool> UpdateProfileAsync(Guid userId, string name, string lastName, string email);
        Task<bool> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);
        Task<string> SaveAvatarAsync(IFormFile file, Guid userId);
    }

    public class ProfileService : IProfileService
    {
        private readonly AppDbContext _context;
        private readonly IPasswordService _passwordService;
        private readonly string _avatarDirectory = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "avatars");

        public ProfileService(AppDbContext context, IPasswordService passwordService)
        {
            _context = context;
            _passwordService = passwordService;

            if (!Directory.Exists(_avatarDirectory))
            {
                Directory.CreateDirectory(_avatarDirectory);
            }
        }

        public async Task<UserProfile?> GetUserByIdAsync(Guid userId)
        {
            return await _context.UserProfiles.FindAsync(userId);
        }

        public async Task<bool> UpdateProfileAsync(Guid userId, string name, string lastName, string email)
        {
            var user = await GetUserByIdAsync(userId);
            if (user == null) return false;

            // Check if email is already taken by another user
            if (user.Email != email && _context.UserProfiles.Any(u => u.Email == email))
            {
                throw new InvalidOperationException("El correo electrónico ya está registrado.");
            }

            user.Name = name;
            user.LastName = lastName;
            user.Email = email;
            user.UpdatedAt = DateOnly.FromDateTime(DateTime.UtcNow);

            _context.UserProfiles.Update(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword)
        {
            var user = await GetUserByIdAsync(userId);
            if (user == null) return false;

            // Verify current password
            if (!_passwordService.VerifyPassword(currentPassword, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("La contraseña actual es incorrecta.");
            }

            // Hash new password and update
            user.PasswordHash = _passwordService.HashPassword(newPassword);
            user.UpdatedAt = DateOnly.FromDateTime(DateTime.UtcNow);

            _context.UserProfiles.Update(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<string> SaveAvatarAsync(IFormFile file, Guid userId)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("El archivo de imagen no es válido.");
            }

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLower();

            if (!allowedExtensions.Contains(fileExtension))
            {
                throw new InvalidOperationException("Solo se permiten archivos .jpg, .jpeg, .png y .webp");
            }

            // Validate file size (max 5MB)
            const long maxFileSize = 5 * 1024 * 1024;
            if (file.Length > maxFileSize)
            {
                throw new InvalidOperationException("El archivo no debe superar 5MB.");
            }

            var user = await GetUserByIdAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("Usuario no encontrado.");
            }

            // Delete old avatar if exists
            if (!string.IsNullOrEmpty(user.AvatarUrl))
            {
                var oldAvatarPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", user.AvatarUrl.TrimStart('/'));
                if (File.Exists(oldAvatarPath))
                {
                    File.Delete(oldAvatarPath);
                }
            }

            // Generate unique filename
            var fileName = $"{userId}_{DateTime.UtcNow.Ticks}{fileExtension}";
            var filePath = Path.Combine(_avatarDirectory, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Update user avatar URL
            var avatarUrl = $"/avatars/{fileName}";
            user.AvatarUrl = avatarUrl;
            user.UpdatedAt = DateOnly.FromDateTime(DateTime.UtcNow);

            _context.UserProfiles.Update(user);
            await _context.SaveChangesAsync();

            return avatarUrl;
        }
    }
}
