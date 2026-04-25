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

        public async Task<List<CalendarDayDto>> GetCalendarAsync(int userId, int year, int month)
        {
            var periods = await _periodService.GetLast5PeriodsByUser(userId);

            var startMonth = new DateOnly(year, month, 1);
            var endMonth = startMonth.AddMonths(1).AddDays(-1);

            var calendar = new List<CalendarDayDto>();

            var latestPeriod = periods.OrderByDescending(p => p.StartDate).FirstOrDefault();

            var averageCycleLength = _cycleService.CalculateAverageCycleLength(periods);

            for (var day = startMonth; day <= endMonth; day = day.AddDays(1))
            {
                var isPeriod = false;

                if (periods.Any(p => day >= p.StartDate && day <= p.EndDate))
                {
                    isPeriod = true;
                }

                var cycleInfo = latestPeriod != null ? _cycleService.CalculateCycleInfo(latestPeriod, day, averageCycleLength) : new CycleInfo();

                calendar.Add(new CalendarDayDto
                {
                    Date = day,
                    CycleDay = cycleInfo.CycleDay,
                    IsPeriod = isPeriod,
                    IsFertile = cycleInfo.IsFertile,
                    IsOvulation = cycleInfo.IsOvulation,
                    FertilityLevel = cycleInfo.FertilityLevel,
                    Symptoms = new List<SymptomsDto>()
                });
            }

            return calendar;
        }

        public async Task<CalendarDayDto> GetCalendarDayAsync(int userId, DateOnly date)
        {
            var periods = await _periodService.GetLast5PeriodsByUser(userId);

            var latestPeriod = periods
                .Where(p => p.StartDate <= date)
                .OrderByDescending(p => p.StartDate)
                .FirstOrDefault();

            if (latestPeriod == null)
            {
                return new CalendarDayDto();
            }

            var averageCycleLength = _cycleService.CalculateAverageCycleLength(periods);

            var cycleInfo = _cycleService.CalculateCycleInfo(latestPeriod, date, averageCycleLength);

            return new CalendarDayDto
            {
                Date = date,
                CycleDay = cycleInfo.CycleDay,
                IsPeriod = date >= latestPeriod.StartDate && date <= latestPeriod.EndDate,
                IsOvulation = cycleInfo.IsOvulation,
                IsFertile = cycleInfo.IsFertile,
                FertilityLevel = cycleInfo.FertilityLevel?.ToLower() ?? "low"
            };
        }

        public async Task<string> UpdateCalendar(int userId, string? periodId, DateOnly start, DateOnly end)
        {
            var periods = await _periodService.GetLast5PeriodsByUser(userId);
            
            if (periodId != null && int.TryParse(periodId, out int id))
            {
                bool hasOverlap = periods.Any(p => p.Id != periodId && start <= (p.EndDate ?? DateOnly.MaxValue) && end >= p.StartDate);
                if (hasOverlap)
                    throw new InvalidOperationException("Periodo se solapa con otro");
                
                await _periodService.UpdatePeriod(userId, periodId, start, end);
                return "updated";
            }
            
            bool hasOverlapCreate = periods.Any(p => start <= (p.EndDate ?? DateOnly.MaxValue) && end >= p.StartDate);
            if (hasOverlapCreate)
                throw new InvalidOperationException("Periodo se solapa con otro");
                
            var periodDto = new PeriodDto { StartDate = start, EndDate = end };
            await _periodService.AddPeriodAsync(userId, periodDto);
            return "created";
        }
    }
}
