using System.Net;
using Mailjet.Client;
using Mailjet.Client.TransactionalEmails;
using Mailjet.Client.Resources;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

public sealed class MailjetEmailSender : IEmailSender
{
    private const int MaximumAttempts = 3;
    private static readonly TimeSpan AttemptTimeout = TimeSpan.FromSeconds(10);
    private static readonly TimeSpan[] RetryDelays =
    [
        TimeSpan.FromMilliseconds(250),
        TimeSpan.FromMilliseconds(750)
    ];

    private readonly IMailjetClient _mailjetClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<MailjetEmailSender> _logger;

    public MailjetEmailSender(
        IMailjetClient mailjetClient,
        IConfiguration configuration,
        ILogger<MailjetEmailSender> logger)
    {
        _mailjetClient = mailjetClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendPasswordResetEmailAsync(
        string recipientEmail,
        string resetLink,
        DateTime expiresAt,
        string locale)
    {
        var content = PasswordResetEmailContent.Create(locale, resetLink, expiresAt);
        var message = new TransactionalEmailBuilder()
            .WithFrom(new SendContact(GetFromEmail(), GetFromName()))
            .WithTo(new SendContact(recipientEmail))
            .WithSubject(content.Subject)
            .WithHtmlPart(content.HtmlBody)
            .WithTextPart(content.TextBody)
            .Build();

        for (var attempt = 1; attempt <= MaximumAttempts; attempt++)
        {
            try
            {
                var response = await _mailjetClient
                    .PostAsync(BuildRequest(message))
                    .WaitAsync(AttemptTimeout);

                if (response.IsSuccessStatusCode && IsAccepted(response.Content))
                    return;

                if (response.IsSuccessStatusCode)
                    throw new InvalidOperationException("Mailjet did not accept the password reset email.");

                if (!IsTransient(response.StatusCode) || attempt == MaximumAttempts)
                {
                    throw new InvalidOperationException(
                        $"Mailjet rejected the password reset email with status {response.StatusCode}.");
                }
            }
            catch (Exception ex) when (IsTransient(ex) && attempt < MaximumAttempts)
            {
                _logger.LogWarning(
                    ex,
                    "Transient Mailjet failure on password reset attempt {Attempt}",
                    attempt);
                await Task.Delay(RetryDelays[attempt - 1]);
                continue;
            }

            if (attempt < MaximumAttempts)
                await Task.Delay(RetryDelays[attempt - 1]);
        }
    }

    private string GetFromEmail() =>
        Environment.GetEnvironmentVariable("MAILJET_FROM_EMAIL")
        ?? _configuration["Mailjet:FromEmail"]
        ?? "dianaflowapp@gmail.com";

    private string GetFromName() =>
        Environment.GetEnvironmentVariable("MAILJET_FROM_NAME")
        ?? _configuration["Mailjet:FromName"]
        ?? "DianaFlow";

    private static bool IsTransient(Exception exception) =>
        exception is HttpRequestException or TimeoutException or TaskCanceledException;

    private static bool IsTransient(int statusCode) =>
        statusCode == StatusCodes.Status429TooManyRequests || statusCode >= 500;

    private static bool IsAccepted(JObject content) =>
        string.Equals(
            content["Messages"]?.First?["Status"]?.Value<string>(),
            "success",
            StringComparison.OrdinalIgnoreCase);

    private static MailjetRequest BuildRequest(TransactionalEmail message)
    {
        var serializer = JsonSerializer.Create(new JsonSerializerSettings
        {
            DefaultValueHandling = DefaultValueHandling.Ignore,
            Converters = { new Newtonsoft.Json.Converters.StringEnumConverter() }
        });

        return new MailjetRequest
        {
            Resource = SendV31.Resource,
            Body = JObject.FromObject(new
            {
                Messages = new[] { message },
                AdvanceErrorHandling = true
            }, serializer)
        };
    }
}

public sealed record PasswordResetEmailContent(
    string Subject,
    string HtmlBody,
    string TextBody)
{
    public static PasswordResetEmailContent Create(
        string locale,
        string resetLink,
        DateTime expiresAt)
    {
        var safeLink = WebUtility.HtmlEncode(resetLink);
        var expiry = $"{expiresAt:yyyy-MM-dd HH:mm} UTC";

        return string.Equals(locale, "es-MX", StringComparison.OrdinalIgnoreCase)
            ? new PasswordResetEmailContent(
                "Restablece tu contraseña de DianaFlow",
                $"""
                <p>Hola:</p>
                <p>Recibimos una solicitud para restablecer tu contraseña de DianaFlow.</p>
                <p><a href="{safeLink}">Elegir una contraseña nueva</a></p>
                <p>Este enlace vence a las {WebUtility.HtmlEncode(expiry)} y solo puede usarse una vez.</p>
                <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
                <p>DianaFlow</p>
                """,
                $"""
                Hola:

                Recibimos una solicitud para restablecer tu contraseña de DianaFlow.

                Usa este enlace para elegir una contraseña nueva:
                {resetLink}

                Este enlace vence a las {expiry} y solo puede usarse una vez.

                Si no solicitaste este cambio, puedes ignorar este correo.

                DianaFlow
                """)
            : new PasswordResetEmailContent(
                "Reset your DianaFlow password",
                $"""
                <p>Hi,</p>
                <p>We received a request to reset your DianaFlow password.</p>
                <p><a href="{safeLink}">Choose a new password</a></p>
                <p>This link expires at {WebUtility.HtmlEncode(expiry)} and can be used only once.</p>
                <p>If you did not request a password reset, you can ignore this email.</p>
                <p>DianaFlow</p>
                """,
                $"""
                Hi,

                We received a request to reset your DianaFlow password.

                Use this link to choose a new password:
                {resetLink}

                This link expires at {expiry} and can be used only once.

                If you did not request a password reset, you can ignore this email.

                DianaFlow
                """);
    }
}
