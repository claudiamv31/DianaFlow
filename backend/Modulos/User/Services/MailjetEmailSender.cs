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
    private readonly ILogger<MailjetEmailSender> _logger;

    public MailjetEmailSender(IMailjetClient mailjetClient, ILogger<MailjetEmailSender> logger)
    {
        _mailjetClient = mailjetClient;
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
            .WithFrom(new SendContact("dianaflowapp@gmail.com", "DianaFlow"))
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
