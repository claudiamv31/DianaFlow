public interface IPasswordResetRateLimiter
{
    bool TryAcquire(string email, string ipAddress);
}
