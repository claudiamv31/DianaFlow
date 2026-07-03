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

        [Theory]
        [InlineData(28, 9, 15, 14)]
        [InlineData(30, 11, 17, 16)]
        [InlineData(32, 13, 19, 18)]
        public void CalculatePhaseInfo_ForOvulation_ShiftsWithCycleLength(
            int cycleLength,
            int expectedFertileStart,
            int expectedFertileEnd,
            int expectedOvulationDay)
        {
            var service = new CycleService(null!, null!);
            var cycleStart = new DateOnly(2026, 6, 1);

            var fertileStart = service.CalculatePhaseInfo(
                cycleStart,
                cycleLength,
                cycleStart.AddDays(expectedFertileStart - 1),
                5);

            var ovulation = service.CalculatePhaseInfo(
                cycleStart,
                cycleLength,
                cycleStart.AddDays(expectedOvulationDay - 1),
                5);

            var fertileEnd = service.CalculatePhaseInfo(
                cycleStart,
                cycleLength,
                cycleStart.AddDays(expectedFertileEnd - 1),
                5);

            fertileStart.Phase.Should().Be(ECyclePhase.Ovulation);
            fertileStart.CycleDay.Should().Be(expectedFertileStart);
            fertileStart.PhaseDay.Should().Be(1);
            fertileStart.PhaseLength.Should().Be(7);
            fertileStart.OvulationDay.Should().Be(expectedOvulationDay);

            ovulation.Phase.Should().Be(ECyclePhase.Ovulation);
            ovulation.CycleDay.Should().Be(expectedOvulationDay);
            ovulation.PhaseDay.Should().Be(6);
            ovulation.PhaseLength.Should().Be(7);
            ovulation.OvulationDay.Should().Be(expectedOvulationDay);

            fertileEnd.Phase.Should().Be(ECyclePhase.Ovulation);
            fertileEnd.CycleDay.Should().Be(expectedFertileEnd);
            fertileEnd.PhaseDay.Should().Be(7);
            fertileEnd.PhaseLength.Should().Be(7);
            fertileEnd.OvulationDay.Should().Be(expectedOvulationDay);
        }

        [Theory]
        [InlineData(28, 9, 15, 14)]
        [InlineData(30, 11, 17, 16)]
        [InlineData(32, 13, 19, 18)]
        public void CalculateCycleInfo_ForFertileWindow_ShiftsWithCycleLength(
            int cycleLength,
            int expectedFertileStart,
            int expectedFertileEnd,
            int expectedOvulationDay)
        {
            var service = new CycleService(null!, null!);
            var latestPeriod = Period(new DateOnly(2026, 6, 1));

            var beforeFertileWindow = service.CalculateCycleInfo(
                latestPeriod,
                latestPeriod.StartDate.AddDays(expectedFertileStart - 2),
                cycleLength);
            var fertileStart = service.CalculateCycleInfo(
                latestPeriod,
                latestPeriod.StartDate.AddDays(expectedFertileStart - 1),
                cycleLength);
            var ovulation = service.CalculateCycleInfo(
                latestPeriod,
                latestPeriod.StartDate.AddDays(expectedOvulationDay - 1),
                cycleLength);
            var fertileEnd = service.CalculateCycleInfo(
                latestPeriod,
                latestPeriod.StartDate.AddDays(expectedFertileEnd - 1),
                cycleLength);
            var afterFertileWindow = service.CalculateCycleInfo(
                latestPeriod,
                latestPeriod.StartDate.AddDays(expectedFertileEnd),
                cycleLength);

            beforeFertileWindow.IsFertile.Should().BeFalse();
            fertileStart.IsFertile.Should().BeTrue();
            fertileStart.FertilityLevel.Should().Be("medium");
            ovulation.IsOvulation.Should().BeTrue();
            ovulation.FertilityLevel.Should().Be("high");
            fertileEnd.IsFertile.Should().BeTrue();
            fertileEnd.IsOvulation.Should().BeFalse();
            fertileEnd.FertilityLevel.Should().Be("medium");
            afterFertileWindow.IsFertile.Should().BeFalse();
        }

        [Fact]
        public void BuildCycleStatus_OnOvulationDay_IncludesFertilityLevel()
        {
            var service = new CycleService(null!, null!);
            var latestPeriod = Period(new DateOnly(2026, 6, 1));

            var status = service.BuildCycleStatus(
                latestPeriod,
                cycleLength: 28,
                periodLength: 5,
                today: new DateOnly(2026, 6, 14));

            status.CycleDay.Should().Be(14);
            status.FertilityLevel.Should().Be("high");
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
