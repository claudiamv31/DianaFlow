using backend.Data;
using backend.Modulos.User.DTOs;
using backend.Modulos.User.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using System.IdentityModel.Tokens.Jwt;

namespace backend.Tests;

public sealed class PasswordResetLifecycleTests
{
    [Fact]
    public async Task PasswordResetLink_AllowsOnePasswordChangeAndRevokesExistingSession()
    {
        await using var context = CreateContext();
        var emailSender = new RecordingEmailSender();
        var service = CreateService(context, emailSender);
        await RegisterUser(service);
        var existingSession = await service.Login(new LoginDto
        {
            Email = "DIANA@example.com",
            Password = "Original1"
        });
        ReadSessionVersion(existingSession!.AccessToken).Should().Be(0);

        await service.RequestPasswordResetAsync(" diana@example.com ", "es-MX");
        var token = emailSender.LatestToken;
        var result = await service.ResetPasswordAsync(new ResetPasswordDto
        {
            Token = token,
            NewPassword = "Replacement1",
            ConfirmPassword = "Replacement1"
        });

        result.Should().Be(PasswordResetResult.Success);
        (await service.IsPasswordResetTokenValidAsync(token)).Should().BeFalse();
        (await service.Login(new LoginDto
        {
            Email = "diana@example.com",
            Password = "Replacement1"
        })).Should().NotBeNull();
        (await service.RefreshTokenAsync(existingSession.RefreshToken)).Should().BeNull();
        var user = await context.Users.SingleAsync();
        user.SessionVersion.Should().Be(1);
        (await new SessionVersionValidator(context).IsCurrentAsync(user.Id, 0)).Should().BeFalse();
        emailSender.LatestLocale.Should().Be("es-MX");
    }

    [Fact]
    public async Task NewPasswordResetRequest_InvalidatesEarlierLink()
    {
        await using var context = CreateContext();
        var emailSender = new RecordingEmailSender();
        var service = CreateService(context, emailSender);
        await RegisterUser(service);

        await service.RequestPasswordResetAsync("diana@example.com", "en-US");
        var firstToken = emailSender.LatestToken;
        await service.RequestPasswordResetAsync("diana@example.com", "en-US");
        var secondToken = emailSender.LatestToken;

        (await service.IsPasswordResetTokenValidAsync(firstToken)).Should().BeFalse();
        (await service.IsPasswordResetTokenValidAsync(secondToken)).Should().BeTrue();
    }

    [Fact]
    public async Task UndeliveredPasswordResetLink_IsInvalidated()
    {
        await using var context = CreateContext();
        var emailSender = new RecordingEmailSender { FailDelivery = true };
        var service = CreateService(context, emailSender);
        await RegisterUser(service);

        await service.RequestPasswordResetAsync("diana@example.com", "en-US");

        (await service.IsPasswordResetTokenValidAsync(emailSender.LatestToken))
            .Should().BeFalse();
    }

    [Fact]
    public async Task RegistrationAndPasswordChange_EnforceSharedPasswordPolicy()
    {
        await using var context = CreateContext();
        var service = CreateService(context, new RecordingEmailSender());

        var registration = await service.RegisterAsync(new RegisterDto
        {
            Name = "Diana",
            LastName = "Flow",
            Email = "diana@example.com",
            Password = "too-weak"
        });

        registration.Should().Be(RegistrationResult.WeakPassword);
    }

    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private static AuthService CreateService(AppDbContext context, IEmailSender emailSender)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "0123456789abcdef0123456789abcdef",
                ["Jwt:Issuer"] = "DianaFlowBackend",
                ["Jwt:Audience"] = "DianaFlowFrontend",
                ["ClientApp:BaseUrl"] = "https://dianaflow.example"
            })
            .Build();

        return new AuthService(
            context,
            configuration,
            new PasswordService(),
            emailSender,
            NullLogger<AuthService>.Instance);
    }

    private static async Task RegisterUser(AuthService service)
    {
        var result = await service.RegisterAsync(new RegisterDto
        {
            Name = "Diana",
            LastName = "Flow",
            Email = "Diana@Example.com",
            Password = "Original1",
            TimeZone = "America/Mazatlan"
        });
        result.Should().Be(RegistrationResult.Success);
    }

    private static int ReadSessionVersion(string accessToken)
    {
        var token = new JwtSecurityTokenHandler().ReadJwtToken(accessToken);
        return int.Parse(token.Claims.Single(claim => claim.Type == "session_version").Value);
    }

    private sealed class RecordingEmailSender : IEmailSender
    {
        public string LatestToken { get; private set; } = string.Empty;
        public string LatestLocale { get; private set; } = string.Empty;
        public bool FailDelivery { get; init; }

        public Task SendPasswordResetEmailAsync(
            string recipientEmail,
            string resetLink,
            DateTime expiresAt,
            string locale)
        {
            LatestToken = Uri.UnescapeDataString(
                new Uri(resetLink).Query.TrimStart('?').Split('=', 2)[1]);
            LatestLocale = locale;
            if (FailDelivery)
                throw new HttpRequestException("Mailjet unavailable");
            return Task.CompletedTask;
        }
    }
}
