using System;
using System.Collections.Generic;
using System.Linq;
using backend.Modulos.Periods.DTOs;
using backend.Modulos.Cycles.DTOs;

namespace backend.Modulos.Cycles.Services
{
    public class CycleService
    {
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

        public PeriodStatus BuildCycleStatus(PeriodDto latest, int cycleLength, int periodLength)
        {
            var nextPeriodStart = latest.StartDate.AddDays(cycleLength);
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            
            int daysDiff = nextPeriodStart.DayNumber - today.DayNumber;
            
            string status;
            if (today >= latest.StartDate && today <= latest.EndDate)
            {
                status = "active_period";
                daysDiff = latest.EndDate.DayNumber - today.DayNumber;
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

            return new PeriodStatus
            {
                StartDate = nextPeriodStart,
                EndDate = nextPeriodStart.AddDays(periodLength - 1),
                CycleLength = cycleLength,
                Status = status,
                Days = daysDiff
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
    }
}
