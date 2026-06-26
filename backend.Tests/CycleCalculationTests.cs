using FluentAssertions;
using backend.Modulos.Cycles.Enums;
using backend.Modulos.Cycles.Services;
using backend.Modulos.Periods.DTOs;
using backend.Modulos.Stats.Services;

namespace backend.Tests
{
    public class CycleCalculationTests
    {
        [Fact]
        public void CalculateRegularity_WithSingleOutOfRangeCycle_DoesNotReturnPerfectScore()
        {
            var service = new StatsService(null!, null!);
            var periods = new List<PeriodDto>
            {
                Period(new DateOnly(2026, 2, 12)),
                Period(new DateOnly(2026, 1, 1))
            };

            var regularity = service.CalculateRegularity(periods);

            regularity.Should().Be(36);
        }

        [Fact]
        public void CalculateRegularity_WithRegularCycleLength_ReturnsPerfectScore()
        {
            var service = new StatsService(null!, null!);
            var periods = new List<PeriodDto>
            {
                Period(new DateOnly(2026, 1, 29)),
                Period(new DateOnly(2026, 1, 1))
            };

            var regularity = service.CalculateRegularity(periods);

            regularity.Should().Be(100);
        }

        [Fact]
        public void CalculateRegularity_WithLargeCycleVariation_DropsScore()
        {
            var service = new StatsService(null!, null!);
            var periods = new List<PeriodDto>
            {
                Period(new DateOnly(2026, 4, 24)),
                Period(new DateOnly(2026, 4, 2)),
                Period(new DateOnly(2026, 2, 26))
            };

            var regularity = service.CalculateRegularity(periods);

            regularity.Should().Be(44);
        }

        [Fact]
        public void CalculatePhaseInfo_ForMenstruation_ReturnsMenstruationDay()
        {
            var service = new CycleService(null!, null!);

            var phase = service.CalculatePhaseInfo(
                new DateOnly(2026, 6, 1),
                28,
                new DateOnly(2026, 6, 3),
                5);

            phase.Phase.Should().Be(ECyclePhase.Menstruation);
            phase.CycleDay.Should().Be(3);
            phase.PhaseDay.Should().Be(3);
            phase.PhaseLength.Should().Be(5);
        }

        [Fact]
        public void CalculatePhaseInfo_ForOvulation_ReturnsOvulationWindowDay()
        {
            var service = new CycleService(null!, null!);

            var phase = service.CalculatePhaseInfo(
                new DateOnly(2026, 6, 1),
                28,
                new DateOnly(2026, 6, 14),
                5);

            phase.Phase.Should().Be(ECyclePhase.Ovulation);
            phase.CycleDay.Should().Be(14);
            phase.PhaseDay.Should().Be(2);
            phase.PhaseLength.Should().Be(3);
        }

        private static PeriodDto Period(DateOnly startDate)
        {
            return new PeriodDto
            {
                StartDate = startDate,
                EndDate = startDate.AddDays(4)
            };
        }
    }
}
