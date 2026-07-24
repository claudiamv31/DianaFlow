namespace backend.Modulos.User.DTOs
{
    public class ForgotPasswordRequestDto
    {
        public string Email { get; set; } = string.Empty;
        public string Locale { get; set; } = "en-US";
    }
}
