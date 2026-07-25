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
