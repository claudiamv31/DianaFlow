using backend.Modulos.User.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using backend.Modulos.User.Models;
using backend.Modulos.Profile.Models;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IPasswordService _passwordService;

    public AuthService(AppDbContext context, IConfiguration configuration, IPasswordService passwordService)
    {
        _context = context;
        _configuration = configuration;
        _passwordService = passwordService;
    }

    public async Task<string?> RegisterAsync(RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            return "The email is already in use.";

        var user = new User
        {
            Email = dto.Email,
            PasswordHash = _passwordService.HashPassword(dto.Password)
        };

        user.Profile = new Profile
        {
            Name = dto.Name,
            LastName = dto.LastName
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return null; // Null means success
    }

    public async Task<string?> Login(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        
        if (user == null || !_passwordService.VerifyPassword(dto.Password, user.PasswordHash))
            return null; // Return null if auth fails

        return GenerateJwtToken(user);
    }

    private string GenerateJwtToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email)
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(4),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task ChangePasswordAsync(Guid userId, string currentPassword, string newPassword)
    {
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
            throw new InvalidOperationException("User not found.");

        if (!_passwordService.VerifyPassword(
                currentPassword,
                user.PasswordHash))
        {
            throw new UnauthorizedAccessException(
                "The current password is incorrect.");
        }

        user.PasswordHash =
            _passwordService.HashPassword(newPassword);

        await _context.SaveChangesAsync();
    }
}
