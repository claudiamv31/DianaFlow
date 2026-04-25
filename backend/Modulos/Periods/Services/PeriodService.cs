using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Modulos.Periods.Models;
using backend.Modulos.Periods.DTOs;
using backend.Modulos.Cycles.Services;
using backend.Modulos.Users.Services;

namespace backend.Modulos.Periods.Services
{
    public class PeriodService
    {
        private readonly AppDbContext _context;
        private readonly CycleService _cycleService;
        private readonly UsersService _usersService;

        public PeriodService(AppDbContext context, CycleService cycleService, UsersService usersService)
        {
            _context = context;
            _cycleService = cycleService;
            _usersService = usersService;
        }

        public async Task<List<PeriodDto>> GetLast5PeriodsByUser(int userId)
        {
            var periods = await _context.Periods
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.StartDate)
                .Take(5)
                .ToListAsync();

            return periods.Select(MapToDto).ToList();
        }

        public async Task<List<PeriodDto>> GetPeriodsByYearAsync(int userId, int year)
        {
            var startYear = new DateOnly(year, 1, 1);
            var endYear = new DateOnly(year, 12, 31);

            var periods = await _context.Periods
                .Where(p => p.UserId == userId && p.StartDate <= endYear && p.EndDate >= startYear)
                .OrderByDescending(p => p.StartDate)
                .ToListAsync();

            return periods.Select(MapToDto).ToList();
        }

        public async Task<List<PeriodDto>> GetPeriodsByMonthAsync(int userId, int year, int month)
        {
            var startMonth = new DateOnly(year, month, 1);
            var endMonth = startMonth.AddMonths(1).AddDays(-1);

            var periods = await _context.Periods
                .Where(p => p.UserId == userId && p.StartDate <= endMonth && p.EndDate >= startMonth)
                .OrderByDescending(p => p.StartDate)
                .ToListAsync();

            return periods.Select(MapToDto).ToList();
        }

        public async Task<List<PeriodDto>> GetPeriodsPagination(int userId, int page, int pageSize)
        {
            var periods = await _context.Periods
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.StartDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return periods.Select(MapToDto).ToList();
        }

        public async Task<PeriodDto?> GetLatestPeriodAsync(int userId)
        {
            var period = await _context.Periods
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.StartDate)
                .FirstOrDefaultAsync();

            return period != null ? MapToDto(period) : null;
        }

        public async Task<PeriodHomeDto?> GetLatestForHomeAsync(int userId)
        {

            var userTimeZoneId = _usersService.GetUserTimeZone(userId) ?? "UTC";
            var today = _usersService.GetUserToday(userTimeZoneId);

            var periods = await GetLast5PeriodsByUser(userId);
            if (!periods.Any()) return null;

            var cycleLength = _cycleService.CalculateAverageCycleLength(periods);
            var periodLength = CalculateAveragePeriodLength(periods);

            var latest = periods.First();
            var previous = periods.Skip(1).FirstOrDefault();

            var previousCycleStatus = previous != null 
                ? _cycleService.BuildCycleStatus(previous, cycleLength, periodLength, today)
                : null;
            var cycleStatus = _cycleService.BuildCycleStatus(latest, cycleLength, periodLength, today);
            var currentPhase = _cycleService.GetCyclePhase(latest.StartDate, cycleLength, today);

            return new PeriodHomeDto
            {
                StartDate = latest.StartDate,
                EndDate = latest.EndDate,
                DurationDays = periodLength,
                DaysUntilNextPeriod = cycleStatus.Days,
                IsActive = cycleStatus.Status == "active_period",
                CurrentPhase = currentPhase,
                PreviousCycle = previousCycleStatus,
                CycleStatus = cycleStatus
            };
        }

        public async Task<PeriodDto?> GetPeriodById(int id, string userTimeZoneId)
        {
            var period = await _context.Periods.FindAsync(id);
            if (period == null) return null;
            
            var today = _usersService.GetUserToday(userTimeZoneId);

            return new PeriodDto
            {
                Id = period.Id.ToString(),
                StartDate = period.StartDate,
                EndDate = period.EndDate,
                IsActive = !period.EndDate.HasValue || period.EndDate.Value >= today,
                Duration = period.EndDate.HasValue 
                        ? (period.EndDate.Value.DayNumber - period.StartDate.DayNumber) + 1 
                        : null
            };
        }

        public async Task AddPeriodAsync(int userId, PeriodDto request)
        {
            var timeZoneId = _usersService.GetUserTimeZone(userId);
            var today = _usersService.GetUserToday(timeZoneId);

            var period = new backend.Modulos.Periods.Models.Periods
            {
                UserId = userId,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = today
            };

            _context.Periods.Add(period);
            await AddPeriodDays(userId, period.Id, period.StartDate, period.EndDate);
            await _context.SaveChangesAsync();
        }

        private async Task AddPeriodDays(int userId, int periodId, DateOnly startDate, DateOnly? endDate)
        {
            var startDateOnly = startDate.ToDateTime(TimeOnly.MinValue);
            var endDateOnly = endDate?.ToDateTime(TimeOnly.MaxValue);

            var daysToAdd = new List<backend.Modulos.Periods.Models.PeriodDays>();
            for (DateTime dt = startDateOnly; dt <= endDateOnly; dt = dt.AddDays(1))
            {
                daysToAdd.Add(new backend.Modulos.Periods.Models.PeriodDays
                {
                    PeriodId = periodId,
                    Date = dt
                });
            }
            _context.PeriodDays.AddRange(daysToAdd);
        }

        public async Task<bool> UpdatePeriod(int userId, string periodId, DateOnly startDate, DateOnly? endDate)
        {
            if (!int.TryParse(periodId, out int id)) return false;

            var period = await _context.Periods.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
            if (period == null) return false;

            period.StartDate = startDate;
            period.EndDate = endDate;
            period.EndDate = endDate;
            period.UpdatedAt = _usersService.GetUserToday(_usersService.GetUserTimeZone(userId));

            var startDateTime = startDate.ToDateTime(TimeOnly.MinValue);
            var endDateTime = endDate?.ToDateTime(TimeOnly.MaxValue);

            var queryLimpieza = _context.PeriodDays
                    .Where(r => r.PeriodId == id && 
                   (r.Date < startDateTime || 
                   (endDateTime.HasValue && r.Date > endDateTime.Value)));

            await queryLimpieza.ExecuteDeleteAsync();
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeletePeriodAsync(int userId, string periodId)
        {
            if (!int.TryParse(periodId, out int id)) return false;

            var period = await _context.Periods.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
            if (period == null) return false;

            _context.Periods.Remove(period);
            await _context.SaveChangesAsync();
            return true;
        }

        private int CalculateAveragePeriodLength(List<PeriodDto> periods)
        {
            var completedPeriods = periods.Where(p => p.EndDate.HasValue).ToList();
            if (!completedPeriods.Any()) return 5;
            return (int)Math.Round(completedPeriods.Average(p => p.EndDate!.Value.DayNumber - p.StartDate.DayNumber + 1));
        }

        private CycleRegularityLevel GetRegularityLevel(int cycleLength)
        {
            if (cycleLength == 0) return CycleRegularityLevel.Unknown;
            if (cycleLength < 21) return CycleRegularityLevel.Irregular;
            if (cycleLength < 35) return CycleRegularityLevel.Regular;
            if (cycleLength <= 42) return CycleRegularityLevel.Irregular;
            return CycleRegularityLevel.VeryIrregular;
        }

        private PeriodDto MapToDto(backend.Modulos.Periods.Models.Periods entity)
        {
            return new PeriodDto
            {
                Id = entity.Id.ToString(),
                StartDate = entity.StartDate,
                EndDate = entity.EndDate
            };
        }
    }
}
