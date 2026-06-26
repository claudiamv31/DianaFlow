using backend.Modulos.User.DTOs;
using backend.Modulos.User.Models;

public interface IAuthService
{
    Task<string?> RegisterAsync(RegisterDto dto);
    Task<string?> Login(LoginDto dto);
    Task ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);
}