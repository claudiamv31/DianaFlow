using backend.Data;
using Microsoft.EntityFrameworkCore;
using backend.Modulos.Profile.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace backend.Modulos.Profile.Services
{
    public class ProfileService : IProfileService
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        // We inject IWebHostEnvironment to get the physical path to the server's folders
        public ProfileService(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        public async Task<Models.Profile?> GetProfileByUserIdAsync(Guid userId)
        {
            // Using plural _context.Profiles
            return await _context.Profiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);
        }

        public async Task<bool> UpdateProfileAsync(Guid userId, string name, string lastName, string email, string? avatarUrl = null)
        {
            var profile = await _context.Profiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
                return false;

            // Using plural _context.Users
            if (!string.Equals(profile.User.Email, email, StringComparison.OrdinalIgnoreCase)
                && await _context.Users.AnyAsync(u => u.Email.ToLower() == email.ToLower()))
            {
                throw new InvalidOperationException("The email is already in use.");
            }

            profile.Name = name;
            profile.LastName = lastName;
            profile.User.Email = email;

            if (!string.IsNullOrEmpty(avatarUrl))
            {
                profile.AvatarUrl = avatarUrl;
            }

            profile.UpdatedAt = DateOnly.FromDateTime(DateTime.UtcNow);

            _context.Profiles.Update(profile);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<string> SaveAvatarAsync(IFormFile file, Guid userId)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("The image file is not valid.");
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLower();

            if (!allowedExtensions.Contains(fileExtension))
            {
                throw new InvalidOperationException("Only .jpg, .jpeg, .png and .webp files are allowed");
            }

            const long maxFileSize = 5 * 1024 * 1024;
            if (file.Length > maxFileSize)
            {
                throw new InvalidOperationException("The file must not exceed 5MB.");
            }

            // BUG 4 FIX: Fetch without .Include(p => p.User) since we only update the AvatarUrl string
            var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile == null)
            {
                throw new InvalidOperationException("User not found.");
            }

            // BUG 3 FIX: Save to Disk instead of Base64
            // 1. Define the folder path (wwwroot/uploads/avatars)
            var webRootPath = _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsFolder = Path.Combine(webRootPath, "uploads", "avatars");
            
            // 2. Create the directory if it doesn't exist
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // 3. Generate a unique file name to prevent overriding
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // 4. Save the file directly to the disk
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            // 5. Generate the relative URL string to store in the Database
            var avatarUrl = $"/uploads/avatars/{uniqueFileName}";

            // Optional cleanup: Delete old avatar physical file if it exists to save space
            if (!string.IsNullOrEmpty(profile.AvatarUrl) && profile.AvatarUrl.StartsWith("/uploads/avatars/"))
            {
                var oldFilePath = Path.Combine(webRootPath, profile.AvatarUrl.TrimStart('/'));
                if (File.Exists(oldFilePath))
                {
                    File.Delete(oldFilePath);
                }
            }

            profile.AvatarUrl = avatarUrl;
            profile.UpdatedAt = DateOnly.FromDateTime(DateTime.UtcNow);

            _context.Profiles.Update(profile);
            await _context.SaveChangesAsync();

            return avatarUrl;
        }
    }
}