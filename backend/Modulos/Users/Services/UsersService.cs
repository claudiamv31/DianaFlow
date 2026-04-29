using System;
using backend.Data;

namespace backend.Modulos.Users.Services
{
    public class UsersService
    {
        private readonly AppDbContext _context;

        public UsersService(AppDbContext context)
        {
            _context = context;
        }

        public string GetUserTimeZone(Guid  userId)
        {
            var user = _context.UserProfiles.Find(userId);
            if (!string.IsNullOrEmpty(user?.TimeZone))
            {
                return user.TimeZone;
            }
            return "UTC";
        }

        public DateOnly GetUserToday(string timeZoneId)
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
