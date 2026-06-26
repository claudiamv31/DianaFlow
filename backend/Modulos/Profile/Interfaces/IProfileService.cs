using backend.Modulos.Profile.Models;

namespace backend.Modulos.Profile.Services;

public interface IProfileService
{
    Task<Models.Profile?> GetProfileByUserIdAsync(Guid userId);

    Task<bool> UpdateProfileAsync(
        Guid userId,
        string name,
        string lastName,
        string email,
        string? avatarUrl = null);

    Task<string> SaveAvatarAsync(
        IFormFile file,
        Guid userId);
}