using System.Net;

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
        var safeIconUrl = WebUtility.HtmlEncode(
            new Uri(new Uri(resetLink), "/icon.png").AbsoluteUri);
        var expiry = $"{expiresAt:yyyy-MM-dd HH:mm} UTC";
        var safeExpiry = WebUtility.HtmlEncode(expiry);
        var isSpanish = string.Equals(locale, "es-MX", StringComparison.OrdinalIgnoreCase);

        var subject = isSpanish
            ? "Restablece tu contraseña de DianaFlow"
            : "Reset your DianaFlow password";
        var greeting = isSpanish ? "Hola:" : "Hi,";
        var requestMessage = isSpanish
            ? "Recibimos una solicitud para restablecer tu contraseña de DianaFlow."
            : "We received a request to reset your DianaFlow password.";
        var buttonLabel = isSpanish
            ? "Elegir una contraseña nueva"
            : "Choose a new password";
        var expiryMessage = isSpanish
            ? $"Este enlace vence a las {safeExpiry} y solo puede usarse una vez."
            : $"This link expires at {safeExpiry} and can be used only once.";
        var ignoreMessage = isSpanish
            ? "Si no solicitaste este cambio, puedes ignorar este correo."
            : "If you did not request a password reset, you can ignore this email.";

        return new PasswordResetEmailContent(
            subject,
            BuildHtmlBody(
                isSpanish ? "es" : "en",
                safeLink,
                safeIconUrl,
                greeting,
                requestMessage,
                buttonLabel,
                expiryMessage,
                ignoreMessage),
            BuildTextBody(isSpanish, resetLink, expiry));
    }

    private static string BuildHtmlBody(
        string language,
        string safeLink,
        string safeIconUrl,
        string greeting,
        string requestMessage,
        string buttonLabel,
        string expiryMessage,
        string ignoreMessage) =>
        $$"""
        <!doctype html>
        <html lang="{{language}}">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta name="color-scheme" content="light">
          <meta name="supported-color-schemes" content="light">
          <title>DianaFlow</title>
          <style>
            :root { color-scheme: light; supported-color-schemes: light; }
            @media only screen and (max-width: 620px) {
              .email-shell { padding: 24px 12px !important; }
              .email-card { width: 100% !important; }
              .email-content { padding: 36px 24px 32px !important; }
              .reset-button { display: block !important; text-align: center !important; }
            }
          </style>
        </head>
        <body style="margin:0; padding:0; background-color:#FDF8F5; color:#34322F;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background-color:#FDF8F5;">
            <tr>
              <td class="email-shell" align="center" style="padding:48px 16px;">
                <table class="email-card" role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="width:560px; max-width:560px; background-color:#FFFFFF; border:1px solid #ECE7E3; border-radius:24px; box-shadow:0 12px 36px rgba(109,59,71,0.10); overflow:hidden;">
                  <tr>
                    <td height="8" style="height:8px; line-height:8px; font-size:0; background-color:#904958;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td class="email-content" style="padding:44px 48px 40px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="padding:0 0 36px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                              <tr>
                                <td width="48" height="48" style="width:48px; height:48px;">
                                  <img src="{{safeIconUrl}}" width="48" height="48" alt="DianaFlow" style="display:block; width:48px; height:48px; border:0; border-radius:14px;">
                                </td>
                                <td style="padding-left:12px; color:#34322F; font-size:20px; line-height:26px; font-weight:750; letter-spacing:-0.3px;">DianaFlow</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:0 0 14px; color:#34322F; font-size:24px; line-height:32px; font-weight:700;">{{greeting}}</td>
                        </tr>
                        <tr>
                          <td style="padding:0 0 28px; color:#615F5B; font-size:16px; line-height:26px;">{{requestMessage}}</td>
                        </tr>
                        <tr>
                          <td style="padding:0 0 28px;">
                            <a class="reset-button" href="{{safeLink}}" target="_blank" style="display:inline-block; padding:15px 24px; border-radius:12px; background-color:#904958; color:#FFF7F7; font-size:16px; line-height:20px; font-weight:700; text-decoration:none; box-shadow:0 6px 16px rgba(144,73,88,0.22);">{{buttonLabel}}</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:16px 18px; border:1px solid #F29BAB; border-radius:12px; background-color:#FDF7F2; color:#71303F; font-size:14px; line-height:22px;">{{expiryMessage}}</td>
                        </tr>
                        <tr>
                          <td style="padding:28px 0 0; color:#615F5B; font-size:14px; line-height:22px;">{{ignoreMessage}}</td>
                        </tr>
                        <tr>
                          <td style="padding:28px 0 0; color:#904958; font-size:14px; line-height:22px; font-weight:700;">DianaFlow</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        """;

    private static string BuildTextBody(bool isSpanish, string resetLink, string expiry) =>
        isSpanish
            ? $"""
              Hola:

              Recibimos una solicitud para restablecer tu contraseña de DianaFlow.

              Usa este enlace para elegir una contraseña nueva:
              {resetLink}

              Este enlace vence a las {expiry} y solo puede usarse una vez.

              Si no solicitaste este cambio, puedes ignorar este correo.

              DianaFlow
              """
            : $"""
              Hi,

              We received a request to reset your DianaFlow password.

              Use this link to choose a new password:
              {resetLink}

              This link expires at {expiry} and can be used only once.

              If you did not request a password reset, you can ignore this email.

              DianaFlow
              """;
}
