namespace backend.Modulos.User.DTOs;

public enum PasswordChangeResult
{
    Success,
    UserNotFound,
    CurrentPasswordIncorrect,
    WeakPassword,
    PasswordReused
}
