using System;
using System.Collections.Generic;
using System.Linq;
using backend.Modulos.Periods.DTOs;
using backend.Modulos.Cycles.DTOs;
using backend.Data;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.EntityFrameworkCore;
using backend.Modulos.Cycles.Enums;

namespace backend.Modulos.Cycles.Services
{
    public class CycleService
    {
        private readonly AppDbContext _context;
        private readonly IMemoryCache _cache;

        public CycleService(AppDbContext context, IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }
        public int CalculateAverageCycleLength(List<PeriodDto> periods)
        {
            if (periods == null || periods.Count < 2) return 28; // Default
            
            var ordered = periods.OrderByDescending(p => p.StartDate).Take(6).ToList();
            var diffs = new List<int>();
            
            for (int i = 0; i < ordered.Count - 1; i++)
            {
                var cycleLength = ordered[i].StartDate.DayNumber - ordered[i + 1].StartDate.DayNumber;
                if (cycleLength > 0)
                {
                    diffs.Add(cycleLength);
                }
            }
            
            return diffs.Any() ? (int)Math.Round(diffs.Average()) : 28;
        }

        public int CalculateCycleLength(PeriodDto current, PeriodDto previous)
        {
            return current.StartDate.DayNumber - previous.StartDate.DayNumber;
        }

        public CycleStatus BuildCycleStatus(PeriodDto latest, int cycleLength, int periodLength, DateOnly today)
        {
            var nextPeriodStart = latest.StartDate.AddDays(cycleLength);
            var cycleInfo = CalculateCycleInfo(latest, today, cycleLength);
            
            int daysDiff = nextPeriodStart.DayNumber - today.DayNumber;
            var cycleDay = today.DayNumber - latest.StartDate.DayNumber + 1;
            
            string status;
            if (latest.EndDate == null)
            {
                status = "active_period";
                daysDiff = (today.DayNumber - latest.StartDate.DayNumber)+1;
            }
            else if (today >= latest.StartDate && today <= latest.EndDate.Value)
            {
                status = "active_period";
                daysDiff = (latest.EndDate.Value.DayNumber - today.DayNumber)+1;
            }
            else if (daysDiff < 0)
            {
                status = "delayed";
                daysDiff = Math.Abs(daysDiff);
            }
            else if (daysDiff == 0)
            {
                status = "period_should_start_today";
            }
            else
            {
                status = "next_period";
            }

            return new CycleStatus
            {
                StartDate = nextPeriodStart,
                EndDate = nextPeriodStart.AddDays(periodLength - 1),
                CycleLength = cycleLength,
                Status = status,
                CycleDay = cycleDay,
                Days = daysDiff,
                PeriodDuration = (latest.EndDate?.DayNumber ?? 0) - latest.StartDate.DayNumber + 1,
                FertilityLevel = cycleInfo.FertilityLevel
            };
        }

        public CycleInfo CalculateCycleInfo(PeriodDto latest, DateOnly date, int avgCycleLength)
        {
            int cycleDay = date.DayNumber - latest.StartDate.DayNumber + 1;
            var cycleLength = avgCycleLength > 0 ? avgCycleLength : 28;
            var fertileWindow = GetFertileWindow(cycleLength);
            int fertileWindowStart = fertileWindow.Start;
            int fertileWindowEnd = fertileWindow.End;
            int estimatedOvulationDay = fertileWindow.OvulationDay;
            
            bool isOvulation = cycleDay == estimatedOvulationDay;
            bool isFertile = cycleDay > 0 && cycleDay >= fertileWindowStart && cycleDay <= fertileWindowEnd;
            
            string fertilityLevel = "low";
            if (isOvulation) fertilityLevel = "high";
            else if (isFertile) fertilityLevel = "medium";
            
            return new CycleInfo
            {
                CycleDay = cycleDay,
                IsFertile = isFertile,
                IsOvulation = isOvulation,
                FertilityLevel = fertilityLevel
            };
        }

        public ECyclePhase GetCyclePhase(DateOnly periodStartDate, int cycleLength, DateOnly date)
        {
            return CalculatePhaseInfo(periodStartDate, cycleLength, date).Phase;
        }

        public CyclePhaseInfo CalculatePhaseInfo(DateOnly periodStartDate, int cycleLength, DateOnly date, int periodLength = 5)
        {
            var cycleDay = date.DayNumber - periodStartDate.DayNumber + 1;
            var normalizedCycleLength = cycleLength > 0 ? cycleLength : 28;
            var normalizedPeriodLength = Math.Clamp(periodLength > 0 ? periodLength : 5, 1, normalizedCycleLength);
            var fertileWindow = GetFertileWindow(normalizedCycleLength, normalizedPeriodLength + 1);
            int ovulationStart = fertileWindow.Start;
            int ovulationEnd = fertileWindow.End;
            int ovulationDay = fertileWindow.OvulationDay;

            if (cycleDay <= 0)
            {
                return new CyclePhaseInfo
                {
                    Phase = ECyclePhase.Menstruation,
                    CycleDay = cycleDay,
                    PhaseDay = 0,
                    PhaseLength = normalizedPeriodLength,
                    OvulationDay = ovulationDay
                };
            }

            if (cycleDay <= normalizedPeriodLength)
            {
                return new CyclePhaseInfo
                {
                    Phase = ECyclePhase.Menstruation,
                    CycleDay = cycleDay,
                    PhaseDay = cycleDay,
                    PhaseLength = normalizedPeriodLength,
                    OvulationDay = ovulationDay
                };
            }

            if (cycleDay >= ovulationStart && cycleDay <= ovulationEnd)
            {
                return new CyclePhaseInfo
                {
                    Phase = ECyclePhase.Ovulation,
                    CycleDay = cycleDay,
                    PhaseDay = cycleDay - ovulationStart + 1,
                    PhaseLength = ovulationEnd - ovulationStart + 1,
                    OvulationDay = ovulationDay
                };
            }

            if (cycleDay < ovulationStart)
            {
                return new CyclePhaseInfo
                {
                    Phase = ECyclePhase.Follicular,
                    CycleDay = cycleDay,
                    PhaseDay = cycleDay - normalizedPeriodLength,
                    PhaseLength = Math.Max(1, ovulationStart - normalizedPeriodLength - 1),
                    OvulationDay = ovulationDay
                };
            }

            return new CyclePhaseInfo
            {
                Phase = ECyclePhase.Luteal,
                CycleDay = cycleDay,
                PhaseDay = cycleDay - ovulationEnd,
                PhaseLength = Math.Max(1, normalizedCycleLength - ovulationEnd),
                OvulationDay = ovulationDay
            };
        }

        public async Task<string> GetCachedDailyInsightAsync(Guid userId, ECyclePhase phase, DateOnly requestedDate, EPhaseMessageType messageType = EPhaseMessageType.Short)
        {
            // La llave única ahora usa la fecha que seleccionó la usuaria en el calendario
            string cacheKey = $"DailyInsight_{userId}_{requestedDate:yyyyMMdd}_{messageType}";

            if (!_cache.TryGetValue(cacheKey, out string? cachedMessage))
            {
                var messages = await _context.PhaseMessages
                    .Where(m => m.Phase == phase && m.MessageType == messageType)
                    .Select(m => m.Message)
                    .ToListAsync();

                cachedMessage = messages.Any() 
                    ? messages[new Random().Next(messages.Count)] 
                    : "Listen to your body today.";

                // Guardamos en caché para que si vuelve a tocar ese mismo día en la misma sesión, cargue al instante
                var cacheEntryOptions = new MemoryCacheEntryOptions()
                    .SetSlidingExpiration(TimeSpan.FromHours(2)); 

                _cache.Set(cacheKey, cachedMessage, cacheEntryOptions);
            }

            return cachedMessage ?? "Listen to your body today.";
        }     

        private static (int Start, int End, int OvulationDay) GetFertileWindow(int cycleLength, int minimumStartDay = 1)
        {
            var normalizedCycleLength = cycleLength > 0 ? cycleLength : 28;
            var startFloor = Math.Clamp(minimumStartDay, 1, normalizedCycleLength);
            var ovulationDay = Math.Clamp(normalizedCycleLength - 14, startFloor, normalizedCycleLength);
            var fertileWindowStart = Math.Clamp(ovulationDay - 5, startFloor, normalizedCycleLength);
            var fertileWindowEnd = Math.Clamp(ovulationDay + 1, startFloor, normalizedCycleLength);

            return (fertileWindowStart, fertileWindowEnd, ovulationDay);
        }  

    }
}
