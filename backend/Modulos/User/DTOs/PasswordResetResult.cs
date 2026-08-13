namespace backend.Modulos.User.DTOs
{
    public enum PasswordResetResult
    {
        Success,
        InvalidOrExpiredToken,
        PasswordMismatch,
        WeakPassword,
        PasswordReused
    }
}
