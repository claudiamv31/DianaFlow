using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using backend.Modulos.Periods.Services;
using backend.Modulos.Cycles.Services;
using backend.Modulos.Users.Services;
using backend.Modulos.Stats.Services;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__PostgreSQLConnection")
    ?? BuildPostgresConnectionString(Environment.GetEnvironmentVariable("DATABASE_URL"))
    ?? builder.Configuration.GetConnectionString("PostgreSQLConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Database connection string is not configured. Set ConnectionStrings__PostgreSQLConnection or DATABASE_URL.");
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddCors(options =>
{
    var allowedOrigins = GetAllowedOrigins(builder.Configuration)
        ?? [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "http://127.0.0.1:3002",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://dianaflow.netlify.app"
        ];

    options.AddPolicy("AllowReactApp",
        policy => policy.WithOrigins(allowedOrigins)
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();

// Register Module Services
builder.Services.AddScoped<PeriodService>();
builder.Services.AddScoped<CycleService>();
builder.Services.AddScoped<CalendarService>();
builder.Services.AddScoped<UsersService>();
builder.Services.AddScoped<StatsService>();
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<IProfileService, ProfileService>();

builder.Services.AddMemoryCache();
var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.Migrate();
}

app.UseCors("AllowReactApp");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

static string? BuildPostgresConnectionString(string? databaseUrl)
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

static string[]? GetAllowedOrigins(IConfiguration configuration)
{
    var origins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();

    if (origins is { Length: > 0 })
    {
        return origins;
    }

    var commaSeparatedOrigins = Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS");

    return string.IsNullOrWhiteSpace(commaSeparatedOrigins)
        ? null
        : commaSeparatedOrigins
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
}
