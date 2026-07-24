using backend.Modulos.User.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using backend.Modulos.User.Models;
using backend.Modulos.Profile.Models;
using backend.Modulos.Profile.Services;
using backend.Modulos.User.Services;
using System.Collections.Concurrent;

public class AuthService : IAuthService
{
    private static readonly ConcurrentDictionary<Guid, SemaphoreSlim> PasswordResetRequestLocks = new();
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IPasswordService _passwordService;
    private readonly IEmailSender _emailSender;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        AppDbContext context,
        IConfiguration configuration,
        IPasswordService passwordService,
        IEmailSender emailSender,
        ILogger<AuthService> logger)
    {
        _context = context;
        _configuration = configuration;
        _passwordService = passwordService;
        _emailSender = emailSender;
        _logger = logger;
    }

    public async Task<RegistrationResult> RegisterAsync(RegisterDto dto)
    {
        var normalizedEmail = EmailAddressNormalizer.Normalize(dto.Email);

        if (!PasswordPolicy.IsSatisfiedBy(dto.Password))
            return RegistrationResult.WeakPassword;

        if (await _context.Users.AnyAsync(u => u.NormalizedEmail == normalizedEmail))
            return RegistrationResult.EmailAlreadyInUse;

        var user = new User
        {
            Email = normalizedEmail,
            NormalizedEmail = normalizedEmail,
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
        return RegistrationResult.Success;
    }

    public async Task<AuthTokensDto?> Login(LoginDto dto)
    {
        var normalizedEmail = EmailAddressNormalizer.Normalize(dto.Email);
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail);
        
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
            new Claim(ClaimTypes.Email, user.Email),
            new Claim("session_version", user.SessionVersion.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<PasswordChangeResult> ChangePasswordAsync(
        Guid userId,
        string currentPassword,
        string newPassword)
    {
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
            return PasswordChangeResult.UserNotFound;

        if (!_passwordService.VerifyPassword(
                currentPassword,
                user.PasswordHash))
        {
            return PasswordChangeResult.CurrentPasswordIncorrect;
        }

        if (!PasswordPolicy.IsSatisfiedBy(newPassword))
            return PasswordChangeResult.WeakPassword;

        if (_passwordService.VerifyPassword(newPassword, user.PasswordHash))
            return PasswordChangeResult.PasswordReused;

        user.PasswordHash =
            _passwordService.HashPassword(newPassword);

        await _context.SaveChangesAsync();
        return PasswordChangeResult.Success;
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

    public async Task RequestPasswordResetAsync(string email, string locale)
    {
        var normalizedEmail = EmailAddressNormalizer.Normalize(email);

        if (string.IsNullOrWhiteSpace(normalizedEmail))
            return;

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail);

        if (user == null)
            return;

        var requestLock = PasswordResetRequestLocks.GetOrAdd(
            user.Id,
            _ => new SemaphoreSlim(1, 1));
        await requestLock.WaitAsync();

        try
        {
            await CreateAndSendPasswordResetAsync(user, locale);
        }
        finally
        {
            requestLock.Release();
        }
    }

    private async Task CreateAndSendPasswordResetAsync(User user, string locale)
    {

        var now = DateTime.UtcNow;
        var cleanupThreshold = now.AddHours(-24);
        var obsoleteTokens = await _context.PasswordResetTokens
            .Where(token =>
                token.ExpiresAt <= cleanupThreshold ||
                (token.UsedAt != null && token.UsedAt <= cleanupThreshold))
            .ToListAsync();
        _context.PasswordResetTokens.RemoveRange(obsoleteTokens);

        var unusedTokens = await _context.PasswordResetTokens
            .Where(token =>
                token.UserId == user.Id &&
                token.UsedAt == null)
            .ToListAsync();

        foreach (var activeToken in unusedTokens)
        {
            activeToken.UsedAt = now;
        }

        var rawToken = GenerateSecureToken();
        var expiresAt = now.AddMinutes(15);

        _context.PasswordResetTokens.Add(new PasswordResetToken
        {
            TokenHash = HashToken(rawToken),
            CreatedAt = now,
            ExpiresAt = expiresAt,
            UserId = user.Id
        });

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogWarning(
                ex,
                "A concurrent password reset request already created a token for user {UserId}",
                user.Id);
            return;
        }

        var resetLink = BuildPasswordResetLink(rawToken);

        try
        {
            await _emailSender.SendPasswordResetEmailAsync(
                user.Email,
                resetLink,
                expiresAt,
                NormalizeLocale(locale));
        }
        catch (Exception ex)
        {
            var undeliveredToken = await _context.PasswordResetTokens
                .FirstOrDefaultAsync(token => token.TokenHash == HashToken(rawToken));
            if (undeliveredToken is not null && undeliveredToken.UsedAt is null)
            {
                undeliveredToken.UsedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            _logger.LogError(
                ex,
                "Mailjet could not accept a password reset email for user {UserId}",
                user.Id);
        }
    }

    public async Task<PasswordResetResult> ResetPasswordAsync(ResetPasswordDto dto)
    {
        if (dto.NewPassword != dto.ConfirmPassword)
            return PasswordResetResult.PasswordMismatch;

        if (string.IsNullOrWhiteSpace(dto.NewPassword))
            return PasswordResetResult.WeakPassword;

        if (!PasswordPolicy.IsSatisfiedBy(dto.NewPassword))
            return PasswordResetResult.WeakPassword;

        var token = dto.Token?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(token))
            return PasswordResetResult.InvalidOrExpiredToken;

        var tokenHash = HashToken(token);
        var now = DateTime.UtcNow;

        var passwordResetToken = await _context.PasswordResetTokens
            .Include(prt => prt.User)
            .FirstOrDefaultAsync(prt => prt.TokenHash == tokenHash);

        if (passwordResetToken == null ||
            passwordResetToken.UsedAt != null ||
            passwordResetToken.ExpiresAt <= now)
        {
            return PasswordResetResult.InvalidOrExpiredToken;
        }

        if (_passwordService.VerifyPassword(dto.NewPassword, passwordResetToken.User.PasswordHash))
            return PasswordResetResult.PasswordReused;

        passwordResetToken.User.PasswordHash = _passwordService.HashPassword(dto.NewPassword);
        passwordResetToken.User.SessionVersion++;
        passwordResetToken.UsedAt = now;

        var refreshTokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == passwordResetToken.UserId && !rt.IsRevoked)
            .ToListAsync();

        foreach (var refreshToken in refreshTokens)
        {
            refreshToken.IsRevoked = true;
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            return PasswordResetResult.InvalidOrExpiredToken;
        }

        return PasswordResetResult.Success;
    }

    public async Task<bool> IsPasswordResetTokenValidAsync(string token)
    {
        var normalizedToken = token?.Trim() ?? string.Empty;
        if (normalizedToken.Length == 0)
            return false;

        var tokenHash = HashToken(normalizedToken);
        var now = DateTime.UtcNow;

        return await _context.PasswordResetTokens
            .AsNoTracking()
            .AnyAsync(resetToken =>
                resetToken.TokenHash == tokenHash &&
                resetToken.UsedAt == null &&
                resetToken.ExpiresAt > now);
    }

    private string BuildPasswordResetLink(string token)
    {
        var baseUrl = Environment.GetEnvironmentVariable("CLIENT_APP_BASE_URL")
            ?? _configuration["ClientApp:BaseUrl"]
            ?? "http://localhost:3000";

        return $"{baseUrl.TrimEnd('/')}/reset-password?token={Uri.EscapeDataString(token)}";
    }

    private static string GenerateSecureToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }

    private static string HashToken(string token)
    {
        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(hashBytes);
    }

    private static string NormalizeLocale(string? locale)
    {
        return string.Equals(locale, "es-MX", StringComparison.OrdinalIgnoreCase)
            ? "es-MX"
            : "en-US";
    }
}
