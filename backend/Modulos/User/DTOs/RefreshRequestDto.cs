namespace backend.Modulos.User.DTOs
{
    public class RefreshRequestDto
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }

    public class AuthTokensDto
    {
        public string Token => AccessToken;
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }
}
