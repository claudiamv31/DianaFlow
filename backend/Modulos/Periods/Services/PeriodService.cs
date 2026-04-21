using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Modulos.Periods.Models;
using backend.Modulos.Periods.DTOs;
using backend.Modulos.Cycles.Services;

namespace backend.Modulos.Periods.Services
{
    public class PeriodService
    {
        private readonly AppDbContext _context;
        private readonly CycleService _cycleService;

        public PeriodService(AppDbContext context, CycleService cycleService)
        {
            _context = context;
            _cycleService = cycleService;
        }

        public async Task<List<PeriodDto>> GetPeriodsAsync(string userId)
        {
            var periods = await _context.Periods
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.StartDate)
                .ToListAsync();

            return periods.Select(MapToDto).ToList();
        }

        public async Task<List<PeriodDto>> GetPeriodsByYearAsync(string userId, int year)
        {
            var startYear = new DateOnly(year, 1, 1);
            var endYear = new DateOnly(year, 12, 31);

            var periods = await _context.Periods
                .Where(p => p.UserId == userId && p.StartDate <= endYear && p.EndDate >= startYear)
                .OrderByDescending(p => p.StartDate)
                .ToListAsync();

            return periods.Select(MapToDto).ToList();
        }

        public async Task<List<PeriodDto>> GetPeriodsByMonthAsync(string userId, int year, int month)
        {
            var startMonth = new DateOnly(year, month, 1);
            var endMonth = startMonth.AddMonths(1).AddDays(-1);

            var periods = await _context.Periods
                .Where(p => p.UserId == userId && p.StartDate <= endMonth && p.EndDate >= startMonth)
                .OrderByDescending(p => p.StartDate)
                .ToListAsync();

            return periods.Select(MapToDto).ToList();
        }

        public async Task<List<PeriodDto>> GetPeriodsPagination(string userId, int page, int pageSize)
        {
            var periods = await _context.Periods
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.StartDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return periods.Select(MapToDto).ToList();
        }

        public async Task<PeriodDto?> GetLatestPeriodAsync(string userId)
        {
            var period = await _context.Periods
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.StartDate)
                .FirstOrDefaultAsync();

            return period != null ? MapToDto(period) : null;
        }

        public async Task<PeriodHomeDto?> GetLatestForHomeAsync(string userId)
        {
            var periods = await GetPeriodsAsync(userId);
            if (!periods.Any()) return null;

            var cycleLength = _cycleService.CalculateAverageCycleLength(periods);
            var periodLength = CalculateAveragePeriodLength(periods);

            var latest = periods.First();
            var previous = periods.Skip(1).FirstOrDefault();

            var previousCycleStatus = previous != null
                ? BuildPeriodStatus(previous, periods.Skip(2).FirstOrDefault())
                : null;

            var cycleStatus = _cycleService.BuildCycleStatus(latest, cycleLength, periodLength);

            return new PeriodHomeDto
            {
                StartDate = latest.StartDate,
                EndDate = latest.EndDate,
                DurationDays = periodLength,
                IsActive = cycleStatus.Status == "active_period",
                PreviousCycle = previousCycleStatus,
                CycleStatus = cycleStatus
            };
        }

        public async Task AddPeriodAsync(string userId, DateOnly start, DateOnly end, PeriodFlow flow = PeriodFlow.Medium)
        {
            var period = new backend.Modulos.Periods.Models.Periods
            {
                UserId = userId,
                StartDate = start,
                EndDate = end,
                Flow = flow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
            };

            _context.Periods.Add(period);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> UpdatePeriodAsync(string userId, string periodId, DateOnly start, DateOnly end, PeriodFlow flow = PeriodFlow.Medium)
        {
            if (!int.TryParse(periodId, out int id)) return false;

            var period = await _context.Periods.FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
            if (period == null) return false;

            period.StartDate = start;
            period.EndDate = end;
            period.Flow = flow;
            period.UpdatedAt = DateOnly.FromDateTime(DateTime.UtcNow);

            _context.Periods.Update(period);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeletePeriodAsync(string userId, string periodId)
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
            if (!periods.Any()) return 5;
            return (int)Math.Round(periods.Average(p => p.EndDate.DayNumber - p.StartDate.DayNumber + 1));
        }

        private PeriodStatus BuildPeriodStatus(PeriodDto period, PeriodDto? previousPeriod)
        {
            int cycleLength = previousPeriod != null ? _cycleService.CalculateCycleLength(period, previousPeriod) : 30;
            return new PeriodStatus
            {
                StartDate = period.StartDate,
                EndDate = period.EndDate,
                CycleLength = cycleLength,
                RegularityLevel = previousPeriod != null ? GetRegularityLevel(cycleLength) : CycleRegularityLevel.Unknown
            };
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
                EndDate = entity.EndDate,
                PeriodFlow = entity.Flow
            };
        }
    }
}
