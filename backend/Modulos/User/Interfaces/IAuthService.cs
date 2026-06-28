using backend.Modulos.User.DTOs;

public interface IAuthService
{
    Task<string?> RegisterAsync(RegisterDto dto);
    Task<AuthTokensDto?> Login(LoginDto dto);
    Task<AuthTokensDto?> RefreshTokenAsync(string refreshToken);
    Task LogoutAsync(Guid userId);
    Task ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);
}
