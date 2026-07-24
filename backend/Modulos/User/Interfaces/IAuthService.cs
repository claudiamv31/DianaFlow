using backend.Modulos.User.DTOs;

public interface IAuthService
{
    Task<RegistrationResult> RegisterAsync(RegisterDto dto);
    Task<AuthTokensDto?> Login(LoginDto dto);
    Task<AuthTokensDto?> RefreshTokenAsync(string refreshToken);
    Task LogoutAsync(Guid userId);
    Task<PasswordChangeResult> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);
    Task RequestPasswordResetAsync(string email, string locale);
    Task<bool> IsPasswordResetTokenValidAsync(string token);
    Task<PasswordResetResult> ResetPasswordAsync(ResetPasswordDto dto);
}
