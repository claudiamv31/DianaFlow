using backend.Data;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace backend.Tests;

public sealed class PasswordResetMigrationTests
{
    [Fact]
    public void EmailNormalizationMigration_IsDiscoverableAndGeneratesSafeSql()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql("Host=localhost;Database=unused;Username=unused;Password=unused")
            .Options;
        using var context = new AppDbContext(options);
        var migrator = context.GetService<IMigrator>();

        var script = migrator.GenerateScript(
            "20260701000000_AddPasswordResetTokens",
            "20260723000000_NormalizeUserEmailsAndProtectResetTokens");

        script.Should().Contain("case-insensitive duplicates exist");
        script.Should().Contain("IX_Users_NormalizedEmail");
        script.Should().Contain("LOWER(BTRIM(\"Email\"))");
        script.Should().Contain("SessionVersion");
        script.Should().Contain("IX_PasswordResetTokens_UserId");
        script.Should().Contain("WHERE \"UsedAt\" IS NULL");
    }
}
