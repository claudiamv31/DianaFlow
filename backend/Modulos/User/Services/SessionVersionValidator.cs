using backend.Data;
using Microsoft.EntityFrameworkCore;

public sealed class SessionVersionValidator(AppDbContext context)
{
    public Task<bool> IsCurrentAsync(Guid userId, int sessionVersion) =>
        context.Users
            .AsNoTracking()
            .AnyAsync(user =>
                user.Id == userId &&
                user.SessionVersion == sessionVersion);
}
