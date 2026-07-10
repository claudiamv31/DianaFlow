using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace backend.Data;

public sealed class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__PostgreSQLConnection")
            ?? BuildPostgresConnectionString(Environment.GetEnvironmentVariable("DATABASE_URL"))
            ?? configuration.GetConnectionString("PostgreSQLConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Database connection string is not configured. Set ConnectionStrings__PostgreSQLConnection or DATABASE_URL.");
        }

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        return new AppDbContext(options);
    }

    private static string? BuildPostgresConnectionString(string? databaseUrl)
    {
        if (string.IsNullOrWhiteSpace(databaseUrl))
        {
            return null;
        }

        var databaseUri = new Uri(databaseUrl);
        var userInfo = databaseUri.UserInfo.Split(':', 2);
        var username = Uri.UnescapeDataString(userInfo[0]);
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty;

        var builder = new Npgsql.NpgsqlConnectionStringBuilder
        {
            Host = databaseUri.Host,
            Port = databaseUri.Port > 0 ? databaseUri.Port : 5432,
            Database = databaseUri.AbsolutePath.TrimStart('/'),
            Username = username,
            Password = password,
            SslMode = Npgsql.SslMode.Require
        };

        return builder.ConnectionString;
    }
}
