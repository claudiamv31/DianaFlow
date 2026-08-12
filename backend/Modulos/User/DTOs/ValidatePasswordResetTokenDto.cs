namespace backend.Modulos.User.DTOs;

public sealed class ValidatePasswordResetTokenDto
{
    public string Token { get; set; } = string.Empty;
}
