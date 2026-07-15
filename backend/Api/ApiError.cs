namespace backend.Api;

public sealed record ApiError(string Code, string? Field = null);

public static class ApiErrorCodes
{
    public const string InvalidCredentials = "INVALID_CREDENTIALS";
    public const string EmailAlreadyInUse = "EMAIL_ALREADY_IN_USE";
    public const string NotAuthorized = "NOT_AUTHORIZED";
    public const string UserNotFound = "USER_NOT_FOUND";
    public const string NameRequired = "NAME_REQUIRED";
    public const string EmailRequired = "EMAIL_REQUIRED";
    public const string EmailInvalid = "EMAIL_INVALID";
    public const string ProfileUpdateFailed = "PROFILE_UPDATE_FAILED";
    public const string AvatarRequired = "AVATAR_REQUIRED";
    public const string AvatarInvalid = "AVATAR_INVALID";
    public const string AvatarUploadFailed = "AVATAR_UPLOAD_FAILED";
    public const string RefreshTokenMissing = "REFRESH_TOKEN_MISSING";
    public const string SessionExpired = "SESSION_EXPIRED";
    public const string PeriodDaysRequired = "PERIOD_DAYS_REQUIRED";
    public const string PeriodStartRequired = "PERIOD_START_REQUIRED";
    public const string PeriodIdRequired = "PERIOD_ID_REQUIRED";
    public const string DateRequired = "DATE_REQUIRED";
    public const string PeriodNotFound = "PERIOD_NOT_FOUND";
    public const string PeriodsNotFound = "PERIODS_NOT_FOUND";
    public const string PeriodUpdateFailed = "PERIOD_UPDATE_FAILED";
    public const string CalendarUpdateFailed = "CALENDAR_UPDATE_FAILED";
    public const string InternalError = "INTERNAL_ERROR";
    public const string StatsNotFound = "STATS_NOT_FOUND";
}
