namespace backend.Modulos.User.Services;

public static class PasswordPolicy
{
    public static bool IsSatisfiedBy(string? password) =>
        !string.IsNullOrWhiteSpace(password) &&
        password.Length >= 8 &&
        password.Any(char.IsLower) &&
        password.Any(char.IsUpper) &&
        password.Any(char.IsDigit);
}
