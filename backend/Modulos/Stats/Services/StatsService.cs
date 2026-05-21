using System.Linq;

using backend.Modulos.Periods.DTOs;
using backend.Modulos.Stats.DTOs;
using backend.Modulos.Cycles.Services;
using backend.Modulos.Periods.Services;

namespace backend.Modulos.Stats.Services
{
    public class StatsService
    {
        private readonly PeriodService _periodService;
        private readonly CycleService _cycleService;

        public StatsService(PeriodService periodService, CycleService cycleService)
        {
            _periodService = periodService;
            _cycleService = cycleService;
        }

        public async Task<StatsDto> GetStatsByUserId(Guid userId)
        {
            var periods = await _periodService.GetLast6PeriodsByUser(userId);
            var nextPeriod = await _periodService.GetNextPeriodPredictionAsync(userId);

            var stats = new StatsDto
            {
                AverageCycleLength = _cycleService.CalculateAverageCycleLength(periods),
                AveragePeriodLength = CalculateAveragePeriodLength(periods),
                Regularity = CalculateRegularity(periods),
                NextPeriodStart = nextPeriod?.StartDate,
                NextPeriodEnd = nextPeriod?.EndDate,
                Periods = periods
            };

            return stats;
        }

        private int CalculateAveragePeriodLength(List<PeriodDto> periods)
        {
            var completedPeriods = periods.Where(p => p.EndDate.HasValue).ToList();
            if (!completedPeriods.Any()) return 5;

            return (int)Math.Round(completedPeriods.Average(p => p.EndDate!.Value.DayNumber - p.StartDate.DayNumber + 1));
        }

        public int CalculateRegularity(List<PeriodDto> periods)
        {
            if (periods == null || periods.Count < 2) return 100;

            var ordered = periods.OrderByDescending(p => p.StartDate).Take(6).ToList();
            var cycleLengths = new List<int>();
            
            for (int i = 0; i < ordered.Count - 1; i++)
            {
                cycleLengths.Add(ordered[i].StartDate.DayNumber - ordered[i + 1].StartDate.DayNumber);
            }

            if (!cycleLengths.Any()) return 100;

            double avgCycle = cycleLengths.Average();
            if (avgCycle == 0) return 0;

            double avgDeviation = cycleLengths.Average(c => Math.Abs(c - avgCycle));
            int regularity = (int)Math.Round((1 - (avgDeviation / avgCycle)) * 100);

            return Math.Clamp(regularity, 0, 100);
        }

    }
}