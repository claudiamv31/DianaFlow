using backend.Modulos.User.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using backend.Modulos.User.Models;
using backend.Modulos.Profile.Models;
using backend.Modulos.Profile.Services;

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
            LastName = dto.LastName,
            TimeZone = TimeZoneService.NormalizeTimeZoneId(dto.TimeZone) ?? string.Empty
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return null; // Null means success
    }

    public async Task<AuthTokensDto?> Login(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        
        if (user == null || !_passwordService.VerifyPassword(dto.Password, user.PasswordHash))
            return null; // Return null if auth fails

        var accessToken = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken();

        // Persist the refresh token to the database
        _context.RefreshTokens.Add(new RefreshToken
        {
            Token = refreshToken,
            Expires = DateTime.UtcNow.AddDays(7),
            UserId = user.Id
        });

        await _context.SaveChangesAsync();

        return new AuthTokensDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken
        };
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
            expires: DateTime.UtcNow.AddMinutes(15),
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

    public string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    public async Task<AuthTokensDto?> RefreshTokenAsync(string refreshToken)
    {

        // 1. Find the refresh token in the DB
        var token = await _context.RefreshTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == refreshToken);

        // 2. Security Checks
        // Check if it exists, is not revoked, and is not expired
        if (token == null || token.IsRevoked || token.Expires <= DateTime.UtcNow)
            return null;

        // 3. ROTATE: Generate NEW tokens
        var newAccessToken = GenerateJwtToken(token.User);
        var newRefreshToken = GenerateRefreshToken();

        // 4. Revoke the old refresh token
        token.IsRevoked = true;

        // 5. Create a new refresh token for this session
        _context.RefreshTokens.Add(new RefreshToken
        {
            Token = newRefreshToken,
            Expires = DateTime.UtcNow.AddDays(7),
            UserId = token.UserId
        });

        await _context.SaveChangesAsync();

        return new AuthTokensDto
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken
        };
    }

    public async Task LogoutAsync(Guid userId)
    {
        var refreshTokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == userId && !rt.IsRevoked)
            .ToListAsync();

        foreach (var refreshToken in refreshTokens)
        {
            refreshToken.IsRevoked = true;
        }

        await _context.SaveChangesAsync();
    }
}
