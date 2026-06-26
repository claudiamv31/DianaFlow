using System;
using backend.Data;

namespace backend.Modulos.Profile.Services
{
    public class TimeZoneService
    {
        private readonly AppDbContext _context;

        public TimeZoneService(AppDbContext context)
        {
            _context = context;
        }

        public string GetUserTimeZone(Guid userId)
        {
            var profile = _context.Profiles.FirstOrDefault(p => p.UserId == userId);
            if (!string.IsNullOrEmpty(profile?.TimeZone))
            {
                return profile.TimeZone;
            }
            return "UTC";
        }

        public DateOnly GetProfileToday(string timeZoneId)
        {
            try 
            {
                TimeZoneInfo userTz = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
                DateTime userLocalTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, userTz);
                return DateOnly.FromDateTime(userLocalTime);
            }
            catch 
            {
                return DateOnly.FromDateTime(DateTime.UtcNow);
            }
        }
    }
}
