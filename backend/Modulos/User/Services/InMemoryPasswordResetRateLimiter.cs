using System.Collections.Concurrent;
using backend.Modulos.User.Services;

public sealed class InMemoryPasswordResetRateLimiter : IPasswordResetRateLimiter
{
    private const int RequestLimit = 3;
    private static readonly TimeSpan WindowDuration = TimeSpan.FromMinutes(15);
    private readonly ConcurrentDictionary<string, RateLimitWindow> _windows = new();

    public bool TryAcquire(string email, string ipAddress)
    {
        var key = $"{ipAddress}:{EmailAddressNormalizer.Normalize(email)}";
        var now = DateTime.UtcNow;
        var window = _windows.GetOrAdd(key, _ => new RateLimitWindow(now));

        lock (window.SyncRoot)
        {
            if (window.StartedAt + WindowDuration <= now)
            {
                window.StartedAt = now;
                window.RequestCount = 0;
            }

            if (window.RequestCount >= RequestLimit)
                return false;

            window.RequestCount++;
            return true;
        }
    }

    private sealed class RateLimitWindow(DateTime startedAt)
    {
        public object SyncRoot { get; } = new();
        public DateTime StartedAt { get; set; } = startedAt;
        public int RequestCount { get; set; }
    }
}
