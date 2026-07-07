using System;
using backend.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace backend.Modulos.Profile.Services
{
    public class TimeZoneService
    {
        public const string TimeZoneHeaderName = "X-User-Time-Zone";

        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TimeZoneService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public string GetUserTimeZone(Guid userId)
        {
            var requestTimeZone = GetRequestTimeZone();
            if (!string.IsNullOrEmpty(requestTimeZone))
            {
                return requestTimeZone;
            }

            var profile = _context.Profiles
                .AsNoTracking()
                .FirstOrDefault(p => p.UserId == userId);
            var profileTimeZone = NormalizeTimeZoneId(profile?.TimeZone);
            if (!string.IsNullOrEmpty(profileTimeZone))
            {
                return profileTimeZone;
            }

            return "UTC";
        }

        public DateOnly GetProfileToday(string? timeZoneId)
        {
            var normalizedTimeZoneId = NormalizeTimeZoneId(timeZoneId) ?? "UTC";
            if (!TryFindTimeZoneInfo(normalizedTimeZoneId, out var userTz))
            {
                userTz = TimeZoneInfo.Utc;
            }

            var userLocalTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, userTz);

            return DateOnly.FromDateTime(userLocalTime);
        }

        public static string? NormalizeTimeZoneId(string? timeZoneId)
        {
            if (string.IsNullOrWhiteSpace(timeZoneId))
            {
                return null;
            }

            var trimmedTimeZoneId = timeZoneId.Trim();

            return TryFindTimeZoneInfo(trimmedTimeZoneId, out _)
                ? trimmedTimeZoneId
                : null;
        }

        private static bool TryFindTimeZoneInfo(string timeZoneId, out TimeZoneInfo timeZoneInfo)
        {
            try
            {
                timeZoneInfo = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
                return true;
            }
            catch
            {
            }

            if (TimeZoneInfo.TryConvertIanaIdToWindowsId(timeZoneId, out var windowsTimeZoneId))
            {
                try
                {
                    timeZoneInfo = TimeZoneInfo.FindSystemTimeZoneById(windowsTimeZoneId);
                    return true;
                }
                catch
                {
                }
            }

            if (TimeZoneInfo.TryConvertWindowsIdToIanaId(timeZoneId, out var ianaTimeZoneId))
            {
                try
                {
                    timeZoneInfo = TimeZoneInfo.FindSystemTimeZoneById(ianaTimeZoneId);
                    return true;
                }
                catch
                {
                }
            }

            timeZoneInfo = TimeZoneInfo.Utc;
            return false;
        }

        private string? GetRequestTimeZone()
        {
            var headerValue = _httpContextAccessor.HttpContext?.Request.Headers[TimeZoneHeaderName].FirstOrDefault();
            return NormalizeTimeZoneId(headerValue);
        }
    }
}
