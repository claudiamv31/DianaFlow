using System;
using System.Collections.Generic;
using System.Linq;
using backend.Modulos.Periods.DTOs;
using backend.Modulos.Cycles.DTOs;
using backend.Modulos.Users.Services;
using backend.Data;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.EntityFrameworkCore;
using backend.Modulos.Cycles.Enums;

namespace backend.Modulos.Cycles.Services
{
    public class CycleService
    {
        private readonly UsersService _usersService;
        private readonly AppDbContext _context;
        private readonly IMemoryCache _cache;

        public CycleService(UsersService usersService, AppDbContext context, IMemoryCache cache)
        {
            _usersService = usersService;
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
                diffs.Add(cycleLength);
            }
            
            return (int)Math.Round(diffs.Average());
        }

        public int CalculateCycleLength(PeriodDto current, PeriodDto previous)
        {
            return current.StartDate.DayNumber - previous.StartDate.DayNumber;
        }

        public CycleStatus BuildCycleStatus(PeriodDto latest, int cycleLength, int periodLength, DateOnly today)
        {
            var nextPeriodStart = latest.StartDate.AddDays(cycleLength);
            
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
                PeriodDuration = (latest.EndDate?.DayNumber ?? 0) - latest.StartDate.DayNumber + 1
            };
        }

        public CycleInfo CalculateCycleInfo(PeriodDto latest, DateOnly date, int avgCycleLength)
        {
            int cycleDay = date.DayNumber - latest.StartDate.DayNumber + 1;
            int estimatedOvulationDay = avgCycleLength - 14; 
            
            int fertileWindowStart = estimatedOvulationDay - 5;
            int fertileWindowEnd = estimatedOvulationDay;
            
            bool isOvulation = cycleDay == estimatedOvulationDay;
            bool isFertile = cycleDay >= fertileWindowStart && cycleDay <= fertileWindowEnd;
            
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
            var cycleDay = date.DayNumber - periodStartDate.DayNumber + 1;
            var avgCycleLength = cycleLength > 0 ? cycleLength : 28;

            if (cycleDay >= 1 && cycleDay <= 5) 
            {
                return ECyclePhase.Menstruation;
            }

            var ovulationDay = avgCycleLength - 14;

            if (cycleDay >= ovulationDay - 1 && cycleDay <= ovulationDay + 1)
            {
                return ECyclePhase.Ovulation;
            }

            if (cycleDay < ovulationDay)
            {
                return ECyclePhase.Follicular;
            }

            return ECyclePhase.Luteal;
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
    }
}

