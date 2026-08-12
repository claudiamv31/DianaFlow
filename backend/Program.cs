using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using backend.Modulos.Periods.Services;
using backend.Modulos.Cycles.Services;
using backend.Modulos.Stats.Services;
using backend.Modulos.Profile.Services;
using backend.Modulos.Symptoms.Services;
using System.Text.Json.Serialization;
using System.Text.Json;
using backend.Api;
using Microsoft.AspNetCore.Mvc;
using Mailjet.Client;
using System.IdentityModel.Tokens.Jwt;

var builder = WebApplication.CreateBuilder(args);
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey.Length < 32)
{
    throw new InvalidOperationException(
        "JWT signing key is not configured. Set Jwt__Key to at least 32 characters.");
}

var mailjetApiKey = Environment.GetEnvironmentVariable("MAILJET_API_KEY");
var mailjetSecretKey = Environment.GetEnvironmentVariable("MAILJET_SECRET_KEY");
if (builder.Environment.IsDevelopment())
{
    mailjetApiKey ??= builder.Configuration["Mailjet:ApiKey"];
    mailjetSecretKey ??= builder.Configuration["Mailjet:SecretKey"];
}

if (string.IsNullOrWhiteSpace(mailjetApiKey) || string.IsNullOrWhiteSpace(mailjetSecretKey))
{
    throw new InvalidOperationException(
        builder.Environment.IsDevelopment()
            ? "Mailjet credentials are not configured. Set Mailjet:ApiKey and Mailjet:SecretKey with dotnet user-secrets."
            : "Mailjet credentials are not configured. Set MAILJET_API_KEY and MAILJET_SECRET_KEY.");
}

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
        new BadRequestObjectResult(new ApiError(ApiErrorCodes.InvalidRequest));
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

connectionString = TuneConnectionStringForServerless(connectionString, builder.Environment);

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
                        .AllowAnyHeader()
                        .AllowCredentials());
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
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var userIdValue = context.Principal?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                    ?? context.Principal?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var sessionVersionValue = context.Principal?.FindFirst("session_version")?.Value;
                if (!Guid.TryParse(userIdValue, out var userId) ||
                    !int.TryParse(sessionVersionValue, out var sessionVersion))
                {
                    context.Fail("The session claims are invalid.");
                    return;
                }

                var validator = context.HttpContext.RequestServices
                    .GetRequiredService<SessionVersionValidator>();
                if (!await validator.IsCurrentAsync(userId, sessionVersion))
                    context.Fail("The session has been revoked.");
            }
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddHttpContextAccessor();

// Register Module Services
builder.Services.AddScoped<PeriodService>();
builder.Services.AddScoped<CycleService>();
builder.Services.AddScoped<CalendarService>();
builder.Services.AddScoped<StatsService>();
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<SessionVersionValidator>();
builder.Services.AddSingleton<IPasswordResetRateLimiter, InMemoryPasswordResetRateLimiter>();
builder.Services.AddHttpClient<IMailjetClient, MailjetClient>(client =>
{
    client.SetDefaultSettings();
    client.UseBasicAuthentication(mailjetApiKey ?? string.Empty, mailjetSecretKey ?? string.Empty);
});
builder.Services.AddScoped<IEmailSender, MailjetEmailSender>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<TimeZoneService>();
builder.Services.AddScoped<SymptomService>();

var app = builder.Build();

app.UseExceptionHandler(exceptionHandlerApp =>
{
    exceptionHandlerApp.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(JsonSerializer.Serialize(
            new ApiError(ApiErrorCodes.InternalError),
            new JsonSerializerOptions(JsonSerializerDefaults.Web)));
    });
});

app.UseStatusCodePages(async statusCodeContext =>
{
    var response = statusCodeContext.HttpContext.Response;
    var code = response.StatusCode switch
    {
        StatusCodes.Status401Unauthorized or StatusCodes.Status403Forbidden => ApiErrorCodes.NotAuthorized,
        StatusCodes.Status404NotFound => ApiErrorCodes.ResourceNotFound,
        _ => ApiErrorCodes.InvalidRequest
    };

    response.ContentType = "application/json";
    await response.WriteAsJsonAsync(new ApiError(code));
});

app.UseCors("AllowReactApp");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = context =>
    {
        if (context.Context.Request.Path.StartsWithSegments("/uploads/avatars"))
        {
            context.Context.Response.Headers.CacheControl = "public,max-age=31536000,immutable";
        }
    }
});

app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
    .AllowAnonymous();

app.MapControllers();

app.Run();

static string TuneConnectionStringForServerless(string connectionString, IWebHostEnvironment environment)
{
    if (environment.IsDevelopment())
    {
        return connectionString;
    }

    var builder = new Npgsql.NpgsqlConnectionStringBuilder(connectionString)
    {
        Pooling = true,
        MinPoolSize = 0,
        MaxPoolSize = 2,
        ConnectionIdleLifetime = 60,
        ConnectionPruningInterval = 10
    };

    return builder.ConnectionString;
}

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
