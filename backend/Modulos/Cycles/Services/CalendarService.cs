using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Modulos.Periods.Services;
using backend.Modulos.Cycles.DTOs;
using backend.Modulos.Periods.Models;
using backend.Modulos.Periods.DTOs;

namespace backend.Modulos.Cycles.Services
{
    public class CalendarService
    {
        private readonly CycleService _cycleService;
        private readonly PeriodService _periodService;
        
        public CalendarService(CycleService cycleService, PeriodService periodService)
        {
            _cycleService = cycleService;
            _periodService = periodService;
        }

        public virtual async Task<List<CalendarDayDto>> GetCalendarAsync(Guid userId, int year, int month)
        {
            var periods = await _periodService.GetLast6PeriodsByUser(userId);
            var periodsDays = await _periodService.GetPeriodsDaysByUserId(userId);

            var startMonth = new DateOnly(year, month, 1);
            var endMonth = startMonth.AddMonths(1).AddDays(-1);

            var calendar = new List<CalendarDayDto>();

            var averageCycleLength = _cycleService.CalculateAverageCycleLength(periods);
            var averagePeriodLength = CalculateAveragePeriodLength(periods);

            for (var day = startMonth; day <= endMonth; day = day.AddDays(1))
            {
                var periodForDay = FindPeriodForDate(periods, day);
                var cycleStartPeriod = FindCycleStartPeriod(periods, day);
                var periodDay = periodsDays.FirstOrDefault(pd => pd.Date == day);

                if (cycleStartPeriod == null)
                {
                    calendar.Add(new CalendarDayDto
                    {
                        PeriodId = periodForDay?.Id,
                        Date = day,
                        IsPeriod = periodForDay != null,
                        FertilityLevel = "low",
                        Flow = periodDay?.Flow,
                        PeriodDaysId = periodDay?.Id
                    });
                    continue;
                }

                var cycleInfo = _cycleService.CalculateCycleInfo(cycleStartPeriod, day, averageCycleLength);
                var phaseInfo = _cycleService.CalculatePhaseInfo(
                    cycleStartPeriod.StartDate,
                    averageCycleLength,
                    day,
                    GetPeriodLength(cycleStartPeriod, averagePeriodLength));
                var message = await _cycleService.GetCachedDailyInsightAsync(userId, phaseInfo.Phase, day);

                calendar.Add(new CalendarDayDto
                {
                    PeriodId = periodForDay?.Id,
                    Date = day,
                    CycleDay = phaseInfo.CycleDay,
                    IsPeriod = periodForDay != null,
                    IsFertile = cycleInfo.IsFertile,
                    IsOvulation = cycleInfo.IsOvulation,
                    FertilityLevel = cycleInfo.FertilityLevel?.ToLower() ?? "low",
                    Phase = phaseInfo.Phase.ToString(),
                    PhaseDay = phaseInfo.PhaseDay,
                    PhaseLength = phaseInfo.PhaseLength,
                    DailyInsight = message,
                    Flow = periodDay?.Flow,
                    PeriodDaysId = periodDay?.Id
                });
            }

            return calendar;
        }

        public virtual async Task<CalendarDayDto> GetCalendarDayAsync(Guid userId, DateOnly date)
        {
            var periods = await _periodService.GetLast6PeriodsByUser(userId);
            var periodsDays = await _periodService.GetPeriodsDaysByUserId(userId);

            var latestPeriod = periods
                .Where(p => p.StartDate <= date)
                .OrderByDescending(p => p.StartDate)
                .FirstOrDefault();
            var periodForDay = FindPeriodForDate(periods, date);
            var periodDay = periodsDays.FirstOrDefault(pd => pd.Date == date);

            if (latestPeriod == null)
            {
                return new CalendarDayDto
                {
                    PeriodId = periodForDay?.Id,
                    Date = date,
                    IsPeriod = periodForDay != null,
                    FertilityLevel = "low",
                    Flow = periodDay?.Flow,
                    PeriodDaysId = periodDay?.Id
                };
            }

            var averageCycleLength = _cycleService.CalculateAverageCycleLength(periods);
            var averagePeriodLength = CalculateAveragePeriodLength(periods);
            var phaseInfo = _cycleService.CalculatePhaseInfo(
                latestPeriod.StartDate,
                averageCycleLength,
                date,
                GetPeriodLength(latestPeriod, averagePeriodLength));
            var message = await _cycleService.GetCachedDailyInsightAsync(userId, phaseInfo.Phase, date);

            var cycleInfo = _cycleService.CalculateCycleInfo(latestPeriod, date, averageCycleLength);

            return new CalendarDayDto
            {
                PeriodId = periodForDay?.Id,
                Date = date,
                CycleDay = phaseInfo.CycleDay,
                IsPeriod = periodForDay != null,
                IsOvulation = cycleInfo.IsOvulation,
                IsFertile = cycleInfo.IsFertile,
                FertilityLevel = cycleInfo.FertilityLevel?.ToLower() ?? "low",
                Phase = phaseInfo.Phase.ToString(),
                PhaseDay = phaseInfo.PhaseDay,
                PhaseLength = phaseInfo.PhaseLength,
                DailyInsight = message,
                Flow = periodDay?.Flow,
                PeriodDaysId = periodDay?.Id
            };
        }

        public virtual async Task<string> UpdateCalendar(Guid userId, PeriodInputDto dto)
        {
            var periods = await _periodService.GetLast6PeriodsByUser(userId);
            
            if (dto.PeriodId > 0)
            {
                if (dto.SelectedDays != null && dto.SelectedDays.Any())
                {
                    var sortedDays = dto.SelectedDays.OrderBy(d => d.Date).ToList();
                    var start = sortedDays.First().Date;
                    var end = sortedDays.Last().Date;
                    bool hasOverlap = periods.Any(p => p.Id != dto.PeriodId.ToString() && start <= (p.EndDate ?? DateOnly.MaxValue) && end >= p.StartDate);
                    if (hasOverlap)
                        throw new InvalidOperationException("Periodo se solapa con otro");
                }
                
                await _periodService.UpdatePeriod(userId, dto);
                return "updated";
            }
            
            if (dto.SelectedDays != null && dto.SelectedDays.Any())
            {
                var sortedDays = dto.SelectedDays.OrderBy(d => d.Date).ToList();
                var start = sortedDays.First().Date;
                var end = sortedDays.Last().Date;

                bool hasOverlapCreate = periods.Any(p => start <= (p.EndDate ?? DateOnly.MaxValue) && end >= p.StartDate);
                if (hasOverlapCreate)
                    throw new InvalidOperationException("Periodo se solapa con otro");
                    
                await _periodService.AddPeriodAsync(userId, dto);
                return "created";
            }

            return "no_action";
        }

        private static PeriodDto? FindPeriodForDate(List<PeriodDto> periods, DateOnly date)
        {
            return periods
                .Where(p => p.StartDate <= date && (!p.EndDate.HasValue || p.EndDate.Value >= date))
                .OrderByDescending(p => p.StartDate)
                .FirstOrDefault();
        }

        private static PeriodDto? FindCycleStartPeriod(List<PeriodDto> periods, DateOnly date)
        {
            return periods
                .Where(p => p.StartDate <= date)
                .OrderByDescending(p => p.StartDate)
                .FirstOrDefault();
        }

        private static int CalculateAveragePeriodLength(List<PeriodDto> periods)
        {
            var durations = periods
                .Where(p => p.EndDate.HasValue && p.EndDate.Value >= p.StartDate)
                .Select(p => p.EndDate!.Value.DayNumber - p.StartDate.DayNumber + 1)
                .Where(d => d > 0)
                .ToList();

            return durations.Any() ? (int)Math.Round(durations.Average()) : 5;
        }

        private static int GetPeriodLength(PeriodDto period, int fallbackLength)
        {
            if (period.EndDate.HasValue && period.EndDate.Value >= period.StartDate)
            {
                return period.EndDate.Value.DayNumber - period.StartDate.DayNumber + 1;
            }

            return fallbackLength > 0 ? fallbackLength : 5;
        }
    }
}
