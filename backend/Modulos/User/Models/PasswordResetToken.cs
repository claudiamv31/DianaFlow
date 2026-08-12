namespace backend.Modulos.User.Models;

public class PasswordResetToken
{
    public int Id { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? UsedAt { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}
