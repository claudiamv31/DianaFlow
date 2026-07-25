using FluentAssertions;
using Mailjet.Client;
using Mailjet.Client.TransactionalEmails;
using Mailjet.Client.TransactionalEmails.Response;
using Newtonsoft.Json.Linq;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace backend.Tests;

public sealed class MailjetEmailSenderTests
{
    [Fact]
    public async Task SendPasswordResetEmail_UsesTheValidatedDianaFlowSender()
    {
        MailjetRequest? capturedRequest = null;
        var client = new Mock<IMailjetClient>();
        client
            .Setup(mailjet => mailjet.PostAsync(It.IsAny<MailjetRequest>()))
            .Callback<MailjetRequest>(request => capturedRequest = request)
            .ReturnsAsync(new MailjetResponse(true, 200, SuccessResponse()));
        var sender = CreateSender(client.Object);

        await sender.SendPasswordResetEmailAsync(
            "person@example.com",
            "https://dianaflow.example/reset-password?token=secret",
            DateTime.UtcNow.AddMinutes(15),
            "en-US");

        capturedRequest.Should().NotBeNull();
        var from = capturedRequest!.Body["Messages"]!.First!["From"]!;
        from["Email"]!.Value<string>().Should().Be("dianaflowapp@gmail.com");
        from["Name"]!.Value<string>().Should().Be("DianaFlow");
    }

    [Fact]
    public async Task SendPasswordResetEmail_RetriesTransientFailuresTwice()
    {
        var client = new Mock<IMailjetClient>();
        client
            .SetupSequence(mailjet => mailjet.PostAsync(It.IsAny<MailjetRequest>()))
            .ReturnsAsync(new MailjetResponse(false, 503, new JObject()))
            .ReturnsAsync(new MailjetResponse(false, 429, new JObject()))
            .ReturnsAsync(new MailjetResponse(true, 200, SuccessResponse()));
        var sender = CreateSender(client.Object);

        await sender.SendPasswordResetEmailAsync(
            "person@example.com",
            "https://dianaflow.example/reset-password?token=secret",
            DateTime.UtcNow.AddMinutes(15),
            "en-US");

        client.Verify(
            mailjet => mailjet.PostAsync(It.IsAny<MailjetRequest>()),
            Times.Exactly(3));
    }

    [Fact]
    public void PasswordResetEmailContent_UsesSpanishAndEscapesHtmlLink()
    {
        var content = PasswordResetEmailContent.Create(
            "es-MX",
            "https://dianaflow.example/reset-password?token=a&b",
            new DateTime(2026, 7, 23, 12, 0, 0, DateTimeKind.Utc));

        content.Subject.Should().Be("Restablece tu contraseña de DianaFlow");
        content.HtmlBody.Should().Contain("token=a&amp;b");
        content.TextBody.Should().Contain("token=a&b");
    }

    [Fact]
    public void PasswordResetEmailContent_UsesTheLightThemeEmailDesign()
    {
        var content = PasswordResetEmailContent.Create(
            "en-US",
            "https://dianaflow.example/reset-password?token=secret",
            new DateTime(2026, 7, 23, 12, 0, 0, DateTimeKind.Utc));

        content.HtmlBody.Should().Contain("background-color:#FDF8F5");
        content.HtmlBody.Should().Contain("background-color:#904958");
        content.HtmlBody.Should().Contain("src=\"https://dianaflow.example/icon.png\"");
        content.HtmlBody.Should().Contain("alt=\"DianaFlow\"");
        content.HtmlBody.Should().Contain("class=\"reset-button\"");
        content.HtmlBody.Should().Contain("Choose a new password");
        content.HtmlBody.Should().Contain("This link expires at 2026-07-23 12:00 UTC and can be used only once.");
    }

    [Fact]
    public async Task SendPasswordResetEmail_DoesNotRetryPermanentRejection()
    {
        var client = new Mock<IMailjetClient>();
        client
            .Setup(mailjet => mailjet.PostAsync(It.IsAny<MailjetRequest>()))
            .ReturnsAsync(new MailjetResponse(false, 400, new JObject()));
        var sender = CreateSender(client.Object);

        var action = () => sender.SendPasswordResetEmailAsync(
            "person@example.com",
            "https://dianaflow.example/reset-password?token=secret",
            DateTime.UtcNow.AddMinutes(15),
            "en-US");

        await action.Should().ThrowAsync<InvalidOperationException>();
        client.Verify(
            mailjet => mailjet.PostAsync(It.IsAny<MailjetRequest>()),
            Times.Once);
    }

    private static MailjetEmailSender CreateSender(IMailjetClient client)
    {
        return new MailjetEmailSender(
            client,
            NullLogger<MailjetEmailSender>.Instance);
    }

    private static JObject SuccessResponse() => JObject.Parse(
        """
        { "Messages": [{ "Status": "success" }] }
        """);
}
