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
        Task<bool> UpdateProfileAsync(Guid userId, string name, string lastName, string email, string? avatarUrl = null);
        Task<bool> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);
        Task<string> SaveAvatarAsync(IFormFile file, Guid userId);
    }

    public class ProfileService : IProfileService
    {
        private readonly AppDbContext _context;
        private readonly IPasswordService _passwordService;

        public ProfileService(AppDbContext context, IPasswordService passwordService)
        {
            _context = context;
            _passwordService = passwordService;
        }

        public async Task<UserProfile?> GetUserByIdAsync(Guid userId)
        {
            return await _context.UserProfiles.FindAsync(userId);
        }

        public async Task<bool> UpdateProfileAsync(Guid userId, string name, string lastName, string email, string? avatarUrl = null)
        {
            var user = await GetUserByIdAsync(userId);
            if (user == null) return false;

            // Check if email is already taken by another user
            if (user.Email != email && _context.UserProfiles.Any(u => u.Email == email))
            {
                throw new InvalidOperationException("The email is already in use.");
            }

            user.Name = name;
            user.LastName = lastName;
            user.Email = email;

            // Only update avatar if a new one was provided
            if (!string.IsNullOrEmpty(avatarUrl))
            {
                user.AvatarUrl = avatarUrl;
            }

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
                throw new UnauthorizedAccessException("The current password is incorrect.");
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
                throw new ArgumentException("The image file is not valid.");
            }

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLower();

            if (!allowedExtensions.Contains(fileExtension))
            {
                throw new InvalidOperationException("Only .jpg, .jpeg, .png and .webp files are allowed");
            }

            // Validate file size (max 5MB)
            const long maxFileSize = 5 * 1024 * 1024;
            if (file.Length > maxFileSize)
            {
                throw new InvalidOperationException("The file must not exceed 5MB.");
            }

            var user = await GetUserByIdAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User not found.");
            }

            // Convert file to Base64 Data URL
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            var fileBytes = ms.ToArray();
            var base64String = Convert.ToBase64String(fileBytes);

            var mimeType = fileExtension switch
            {
                ".png" => "image/png",
                ".webp" => "image/webp",
                _ => "image/jpeg"
            };

            var avatarUrl = $"data:{mimeType};base64,{base64String}";

            user.AvatarUrl = avatarUrl;
            user.UpdatedAt = DateOnly.FromDateTime(DateTime.UtcNow);

            _context.UserProfiles.Update(user);
            await _context.SaveChangesAsync();

            return avatarUrl;
        }
    }
}
