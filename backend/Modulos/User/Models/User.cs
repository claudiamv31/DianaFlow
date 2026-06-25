namespace backend.Modulos.User.Models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    
    // Explicitly tell the compiler to use the Model, not the namespace folder
    public backend.Modulos.Profile.Models.Profile Profile { get; set; } = null!;
}