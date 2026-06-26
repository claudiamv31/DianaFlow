using System.Linq;

using backend.Modulos.Periods.DTOs;
using backend.Modulos.Stats.DTOs;
using backend.Modulos.Cycles.Services;
using backend.Modulos.Periods.Services;

namespace backend.Modulos.Stats.Services
{
    public class StatsService
    {
        private const int MinRegularCycleLength = 21;
        private const int MaxRegularCycleLength = 35;
        private const int MaxRegularCycleVariation = 7;
        private const int IrregularScoreCap = 84;
        private const int PenaltyPerIrregularDay = 8;

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
            var durations = periods
                .Where(p => p.EndDate.HasValue && p.EndDate.Value >= p.StartDate)
                .Select(p => p.EndDate!.Value.DayNumber - p.StartDate.DayNumber + 1)
                .Where(d => d > 0)
                .ToList();

            if (!durations.Any()) return 5;

            return (int)Math.Round(durations.Average());
        }

        public int CalculateRegularity(List<PeriodDto> periods)
        {
            if (periods == null || periods.Count < 2) return 100;

            var ordered = periods.OrderByDescending(p => p.StartDate).Take(6).ToList();
            var cycleLengths = new List<int>();
            
            for (int i = 0; i < ordered.Count - 1; i++)
            {
                var cycleLength = ordered[i].StartDate.DayNumber - ordered[i + 1].StartDate.DayNumber;
                if (cycleLength > 0)
                {
                    cycleLengths.Add(cycleLength);
                }
            }

            if (!cycleLengths.Any()) return 100;

            var cycleLengthScore = cycleLengths.Average(GetCycleLengthScore);
            var variationScore = GetCycleVariationScore(cycleLengths);
            int regularity = (int)Math.Round(Math.Min(cycleLengthScore, variationScore));

            return Math.Clamp(regularity, 0, 100);
        }

        private static int GetCycleLengthScore(int cycleLength)
        {
            if (cycleLength >= MinRegularCycleLength && cycleLength <= MaxRegularCycleLength)
            {
                return 100;
            }

            var daysOutsideRange = cycleLength < MinRegularCycleLength
                ? MinRegularCycleLength - cycleLength
                : cycleLength - MaxRegularCycleLength;

            return Math.Clamp(
                IrregularScoreCap - ((daysOutsideRange - 1) * PenaltyPerIrregularDay),
                0,
                IrregularScoreCap);
        }

        private static int GetCycleVariationScore(List<int> cycleLengths)
        {
            if (cycleLengths.Count < 2)
            {
                return 100;
            }

            var variation = cycleLengths.Max() - cycleLengths.Min();
            if (variation <= MaxRegularCycleVariation)
            {
                return 100;
            }

            var daysOverVariation = variation - MaxRegularCycleVariation;

            return Math.Clamp(
                IrregularScoreCap - ((daysOverVariation - 1) * PenaltyPerIrregularDay),
                0,
                IrregularScoreCap);
        }
    }
}
