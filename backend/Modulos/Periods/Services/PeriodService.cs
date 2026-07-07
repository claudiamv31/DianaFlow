using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Modulos.Periods.Models;
using backend.Modulos.Periods.DTOs;
using backend.Modulos.Cycles.Services;
using backend.Modulos.Cycles.DTOs;
using backend.Modulos.Cycles.Enums;
using backend.Modulos.Profile.Services;

namespace backend.Modulos.Periods.Services
{
    public class PeriodService
    {
        private readonly AppDbContext _context;
        private readonly CycleService _cycleService;
        private readonly TimeZoneService _timeZoneService;

        public PeriodService(AppDbContext context, CycleService cycleService, TimeZoneService timeZoneService)
        {
            _context = context;
            _cycleService = cycleService;
            _timeZoneService = timeZoneService;
        }

        public virtual async Task<List<PeriodDto>> GetLast6PeriodsByUser(Guid userId)
        {
            var periods = await _context.Periods
                .AsNoTracking()
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.StartDate)
                .Take(6)
                .ToListAsync();

            var periodIds = periods.Select(p => p.Id).ToList();
            var days = await _context.PeriodDays
                .AsNoTracking()
                .Where(pd => periodIds.Contains(pd.PeriodId))
                .ToListAsync();

            return periods.Select(p => MapToDto(p, days.Where(d => d.PeriodId == p.Id).ToList())).ToList();
        }

        public virtual async Task<List<PeriodDto>> GetPeriodsByYearAsync(Guid userId, int year)
        {
            var startYear = new DateOnly(year, 1, 1);
            var endYear = new DateOnly(year, 12, 31);

            var periods = await _context.Periods
                .AsNoTracking()
                .Where(p => p.UserId == userId && p.StartDate <= endYear && p.EndDate >= startYear)
                .OrderByDescending(p => p.StartDate)
                .ToListAsync();

            var periodIds = periods.Select(p => p.Id).ToList();
            var days = await _context.PeriodDays
                .AsNoTracking()
                .Where(pd => periodIds.Contains(pd.PeriodId))
                .ToListAsync();

            return periods.Select(p => MapToDto(p, days.Where(d => d.PeriodId == p.Id).ToList())).ToList();
        }

        public virtual async Task<List<PeriodDto>> GetPeriodsByMonthAsync(Guid userId, int year, int month)
        {
            var startMonth = new DateOnly(year, month, 1);
            var endMonth = startMonth.AddMonths(1).AddDays(-1);

            var periods = await _context.Periods
                .AsNoTracking()
                .Where(p => p.UserId == userId && p.StartDate <= endMonth && p.EndDate >= startMonth)
                .OrderByDescending(p => p.StartDate)
                .ToListAsync();

            var periodIds = periods.Select(p => p.Id).ToList();
            var days = await _context.PeriodDays
                .AsNoTracking()
                .Where(pd => periodIds.Contains(pd.PeriodId))
                .ToListAsync();

            return periods.Select(p => MapToDto(p, days.Where(d => d.PeriodId == p.Id).ToList())).ToList();
        }

        public virtual async Task<List<PeriodDto>> GetPeriodsPagination(Guid userId, int page, int pageSize)
        {
            var periods = await _context.Periods
                .AsNoTracking()
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.StartDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var periodIds = periods.Select(p => p.Id).ToList();
            var days = await _context.PeriodDays
                .AsNoTracking()
                .Where(pd => periodIds.Contains(pd.PeriodId))
                .ToListAsync();

            return periods.Select(p => MapToDto(p, days.Where(d => d.PeriodId == p.Id).ToList())).ToList();
        }

        public virtual async Task<PeriodDto?> GetLatestPeriodAsync(Guid userId)
        {
            var period = await _context.Periods
                .AsNoTracking()
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.StartDate)
                .FirstOrDefaultAsync();

            if (period == null) return null;

            var days = await _context.PeriodDays
                .AsNoTracking()
                .Where(pd => pd.PeriodId == period.Id)
                .ToListAsync();

            return MapToDto(period, days);
        }

        public virtual async Task<PeriodHomeDto?> GetLatestForHomeAsync(Guid userId)
        {

            var userTimeZoneId = _timeZoneService.GetUserTimeZone(userId) ?? "UTC";
            var today = _timeZoneService.GetProfileToday(userTimeZoneId);

            var periods = await GetLast6PeriodsByUser(userId);
            if (!periods.Any()) return null;

            var cycleLength = _cycleService.CalculateAverageCycleLength(periods);
            var periodLength = CalculateAveragePeriodLength(periods);

            var latest = periods.First();
            var previous = periods.Skip(1).FirstOrDefault();

            // Build actual current cycle status based on latest period
            var actualCycleStatus = _cycleService.BuildCycleStatus(latest, cycleLength, periodLength, today);
            
            // Calculate current period day (which day of the period we're on)
            int currentPeriodDay = 0;
            int daysLeftInPeriod = 0;
            if (actualCycleStatus.Status == "active_period")
            {
                currentPeriodDay = today.DayNumber - latest.StartDate.DayNumber + 1;
                
                // Calculate days left in period (excluding today)
                if (latest.EndDate.HasValue && today <= latest.EndDate.Value)
                {
                    daysLeftInPeriod = latest.EndDate.Value.DayNumber - today.DayNumber;
                }
            }
            
            // Set period-specific values in cycle status
            actualCycleStatus.CurrentPeriodDay = currentPeriodDay;
            actualCycleStatus.DaysLeftInPeriod = daysLeftInPeriod;
            
            // Build PREVIOUS cycle info (not a prediction, but the actual previous period)
            CycleStatus? previousCycleStatus = null;
            if (previous != null)
            {
                // For previous cycle: just map the actual dates from the period
                var nextPeriodAfterPrevious = previous.StartDate.AddDays(cycleLength);
                previousCycleStatus = new CycleStatus
                {
                    StartDate = previous.StartDate,
                    EndDate = previous.EndDate ?? previous.StartDate.AddDays(periodLength - 1),
                    CycleLength = cycleLength,
                    Status = "completed", // Previous cycles are completed
                    CycleDay = 0,
                    Consistency = GetRegularityLevel(cycleLength),
                    Days = previous.EndDate.HasValue ? (previous.EndDate.Value.DayNumber - previous.StartDate.DayNumber + 1) : periodLength
                };
            }

            var currentPhase = _cycleService.GetCyclePhase(latest.StartDate, cycleLength, today);
            var dailyFocus = await _cycleService.GetCachedDailyInsightAsync(userId, currentPhase, today, EPhaseMessageType.Focus);

            return new PeriodHomeDto
            {
                PeriodId = int.Parse(latest.Id),
                Today = today,
                StartDate = latest.StartDate,
                EndDate = latest.EndDate,
                DurationDays = periodLength,
                DaysUntilNextPeriod = actualCycleStatus.Days,
                IsActive = actualCycleStatus.Status == "active_period",
                CurrentPhase = currentPhase,
                PreviousCycle = previousCycleStatus,
                CycleStatus = actualCycleStatus,
                DailyFocus = dailyFocus,
                SelectedDays = latest.SelectedDays
            };
        }

        public virtual async Task<PeriodDto?> GetPeriodById(int id, string userTimeZoneId)
        {
            var period = await _context.Periods
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == id);
            if (period == null) return null;
            
            var today = _timeZoneService.GetProfileToday(userTimeZoneId);
            var days = await _context.PeriodDays
                .AsNoTracking()
                .Where(pd => pd.PeriodId == period.Id)
                .ToListAsync();

            return new PeriodDto
            {
                Id = period.Id.ToString(),
                StartDate = period.StartDate,
                EndDate = period.EndDate,
                IsActive = !period.EndDate.HasValue || period.EndDate.Value >= today,
                Duration = period.EndDate.HasValue 
                        ? (period.EndDate.Value.DayNumber - period.StartDate.DayNumber) + 1 
                        : null,
                PredominantFlow = MapToDto(period, days).PredominantFlow,
                SelectedDays = days
                    .OrderBy(d => d.Date)
                    .Select(d => new DailyRecordInput { Date = d.Date, Flow = d.Flow })
                    .ToList()
            };
        }

        public virtual async Task<List<backend.Modulos.Periods.Models.PeriodDays>> GetPeriodsDaysByUserId(Guid userId)
        {
            return await _context.PeriodDays
                .AsNoTracking()
                .Include(pd => pd.Periods)
                .Where(pd => pd.Periods!.UserId == userId)
                .ToListAsync();
        }

        public virtual async Task AddPeriodAsync(Guid userId, PeriodInputDto dto)
        {
            var timeZoneId = _timeZoneService.GetUserTimeZone(userId);
            var today = _timeZoneService.GetProfileToday(timeZoneId);

            var sortedDays = dto.SelectedDays.OrderBy(d => d.Date).ToList();
            var startDate = sortedDays.First().Date;
            var endDate = sortedDays.Last().Date;

            var period = new backend.Modulos.Periods.Models.Periods
            {
                UserId = userId,
                StartDate = startDate,
                EndDate = endDate,
                UpdatedAt = today
            };

            _context.Periods.Add(period);
            await _context.SaveChangesAsync(); // Esto guarda el periodo en la DB y EF Core auto-asigna el period.Id
            await AddPeriodDays(period.Id, dto.SelectedDays);
        }

        private async Task AddPeriodDays(int periodId, List<DailyRecordInput> dailyRecords)
        {
            var daysToAdd = new List<backend.Modulos.Periods.Models.PeriodDays>();

            foreach(var day in dailyRecords)
            {
                daysToAdd.Add(new backend.Modulos.Periods.Models.PeriodDays
                {
                    PeriodId = periodId,
                    Date = day.Date,
                    Flow = day.Flow
                });
            }
            _context.PeriodDays.AddRange(daysToAdd);
            await _context.SaveChangesAsync();
        }

        public virtual async Task<bool> UpdatePeriod(Guid userId, PeriodInputDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var timeZoneId = _timeZoneService.GetUserTimeZone(userId);
                var today = _timeZoneService.GetProfileToday(timeZoneId);

                var period = await _context.Periods.FirstOrDefaultAsync(p => p.Id == dto.PeriodId && p.UserId == userId);
                if (period == null) return false;
                
                if(dto.SelectedDays == null || !dto.SelectedDays.Any()){
                    _context.Periods.Remove(period);
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                    return true;
                } 

                await _context.PeriodDays.Where(pd => pd.PeriodId == dto.PeriodId).ExecuteDeleteAsync();
                
                var sortedDays = dto.SelectedDays.OrderBy(d => d.Date).ToList();
                period.StartDate = sortedDays.First().Date;
                period.EndDate = sortedDays.Last().Date;
                period.UpdatedAt = today;

                var newPeriodDays = sortedDays.Select(d => new backend.Modulos.Periods.Models.PeriodDays
                {
                    PeriodId = period.Id,
                    Date = d.Date,
                    Flow = d.Flow
                    
                });

                _context.PeriodDays.AddRange(newPeriodDays);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public virtual async Task<bool> UpdatePeriodDayAsync(Guid userId, DailyRecordInput dto)
        {
            var periodDay = await _context.PeriodDays
                .Include(pd => pd.Periods)
                .FirstOrDefaultAsync(pd => pd.Date == dto.Date && pd.Periods!.UserId == userId);

            if (dto.Flow == 0)
            {
                // If Flow is 0 ("None"), we delete the record if it exists
                if (periodDay != null)
                {
                    _context.PeriodDays.Remove(periodDay);
                    await _context.SaveChangesAsync();
                }
                return true;
            }

            if (periodDay != null)
            {
                periodDay.Flow = dto.Flow;
                periodDay.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return true;
            }
            else
            {
                // Find if the date is within an existing period
                var period = await _context.Periods
                    .FirstOrDefaultAsync(p => p.UserId == userId && p.StartDate <= dto.Date && p.EndDate >= dto.Date);
                
                if (period != null)
                {
                    _context.PeriodDays.Add(new backend.Modulos.Periods.Models.PeriodDays { PeriodId = period.Id, Date = dto.Date, Flow = dto.Flow });
                    await _context.SaveChangesAsync();
                    return true;
                }
                else
                {
                    // Si no existe un periodo que cubra este día, no deberíamos poder registrar flujo
                    // (ya que el flujo pertenece a un periodo).
                    return false;
                }
            }
        }

        public virtual async Task<bool> DeletePeriodAsync(Guid userId, string periodId)
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
            var completedPeriods = periods
                .Where(p => p.EndDate.HasValue && p.EndDate.Value >= p.StartDate)
                .ToList();

            if (!completedPeriods.Any()) return 5;

            var durations = completedPeriods
                .Select(p => p.EndDate!.Value.DayNumber - p.StartDate.DayNumber + 1)
                .Where(d => d > 0)
                .ToList();

            if (!durations.Any()) return 5;

            var avg = (int)Math.Round(durations.Average());
            return avg > 0 ? avg : 5;
        }

        private CycleRegularityLevel GetRegularityLevel(int cycleLength)
        {
            if (cycleLength == 0) return CycleRegularityLevel.Unknown;
            if (cycleLength < 21) return CycleRegularityLevel.Irregular;
            if (cycleLength < 35) return CycleRegularityLevel.Regular;
            if (cycleLength <= 42) return CycleRegularityLevel.Irregular;
            return CycleRegularityLevel.VeryIrregular;
        }

        private PeriodDto MapToDto(backend.Modulos.Periods.Models.Periods entity, List<backend.Modulos.Periods.Models.PeriodDays>? days = null)
        {
            string? predominantFlow = null;
            if (days != null && days.Any())
            {
                var flowGroup = days
                    .Where(d => d.Flow > 0)
                    .GroupBy(d => d.Flow)
                    .OrderByDescending(g => g.Count())
                    .FirstOrDefault();

                if (flowGroup != null)
                {
                    predominantFlow = flowGroup.Key switch
                    {
                        1 => "Light Flow",
                        2 => "Medium Flow",
                        3 => "Heavy Flow",
                        _ => null
                    };
                }
            }

            return new PeriodDto
            {
                Id = entity.Id.ToString(),
                StartDate = entity.StartDate,
                EndDate = entity.EndDate,
                Duration = entity.EndDate.HasValue 
                        ? (entity.EndDate.Value.DayNumber - entity.StartDate.DayNumber) + 1 
                        : null,
                PredominantFlow = predominantFlow,
                SelectedDays = days?
                    .OrderBy(d => d.Date)
                    .Select(d => new DailyRecordInput { Date = d.Date, Flow = d.Flow })
                    .ToList() ?? new List<DailyRecordInput>()
            };
        }

        public virtual async Task<PeriodPredictionDto?> GetNextPeriodPredictionAsync(Guid userId)
        {
            var periods = await GetLast6PeriodsByUser(userId);

            if(periods == null || periods.Count == 0)
                return null;

            var avgCycleLength = _cycleService.CalculateAverageCycleLength(periods);
            var lastPeriod = periods.OrderByDescending(p => p.StartDate).First();

            var nextStartDate = lastPeriod.StartDate.AddDays(avgCycleLength);
            var avgPeriodLength = CalculateAveragePeriodLength(periods);

            return new PeriodPredictionDto
            {
                StartDate = nextStartDate,
                EndDate = nextStartDate.AddDays(avgPeriodLength - 1)
            };
        }
    }
}
