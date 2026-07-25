using FluentAssertions;

namespace backend.Tests;

public sealed class PasswordResetRateLimiterTests
{
    [Fact]
    public async Task TryAcquire_AtomicallyAllowsOnlyThreeConcurrentRequestsPerEmailAndIp()
    {
        var limiter = new InMemoryPasswordResetRateLimiter();

        var attempts = await Task.WhenAll(
            Enumerable.Range(0, 20)
                .Select(_ => Task.Run(() =>
                    limiter.TryAcquire(" Diana@Example.com ", "203.0.113.10"))));

        attempts.Count(allowed => allowed).Should().Be(3);
        limiter.TryAcquire("other@example.com", "203.0.113.10").Should().BeTrue();
        limiter.TryAcquire("diana@example.com", "203.0.113.11").Should().BeTrue();
    }
}
