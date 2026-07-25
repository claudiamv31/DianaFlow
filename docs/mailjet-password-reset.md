# Mailjet password reset deployment

DianaFlow sends Password Reset Links through Mailjet from the individually validated address `dianaflowapp@gmail.com`. Validate that exact sender in the Mailjet dashboard before deploying. A free-mail sender is supported, but Mailjet warns that delivery can be less reliable than an authenticated custom domain.

Set these production environment variables on the backend service:

- `MAILJET_API_KEY` — Mailjet API key.
- `MAILJET_SECRET_KEY` — Mailjet secret key.
- `CLIENT_APP_BASE_URL` — public frontend origin, without a trailing path.
- `Jwt__Key` — a random JWT signing key of at least 32 characters.

Do not put API keys or reset links in tracked configuration or production logs. Revoke the previously committed Resend key in the Resend dashboard; removing it from the current file does not remove it from Git history.

The sender identity is intentionally fixed in code as `DianaFlow <dianaflowapp@gmail.com>` so a deployment cannot accidentally send from an unvalidated address.

For local development, store credentials once outside the repository with .NET User Secrets:

```bash
dotnet user-secrets set "Mailjet:ApiKey" "YOUR_API_KEY" --project backend/backend.csproj
dotnet user-secrets set "Mailjet:SecretKey" "YOUR_SECRET_KEY" --project backend/backend.csproj
```

User Secrets are read only in the Development environment. Production continues to require the environment variables above.

After deployment, request one reset for a test account and confirm that:

1. Mailjet accepts and delivers the localized message.
2. The link opens the public frontend and validates before showing the form.
3. The link expires after 15 minutes and cannot be reused.
4. A successful reset invalidates existing sessions and requires normal sign-in.
