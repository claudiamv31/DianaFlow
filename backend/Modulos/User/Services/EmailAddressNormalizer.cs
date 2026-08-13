namespace backend.Modulos.User.Services;

public static class EmailAddressNormalizer
{
    public static string Normalize(string email) => email.Trim().ToLowerInvariant();
}
