namespace backend.Modulos.User.DTOs
{
    public class UpdateProfileDto
    {
        public string Name { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; } // Optional Base64 data URL (e.g. "data:image/png;base64,...")
    }
}
