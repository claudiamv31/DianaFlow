public interface IEmailSender
{
    Task SendPasswordResetEmailAsync(
        string recipientEmail,
        string resetLink,
        DateTime expiresAt,
        string locale);
}
