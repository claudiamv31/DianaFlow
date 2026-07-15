using backend.Modulos.Cycles.Enums;
using backend.Modulos.Cycles.Services;
using backend.Modulos.Periods.Services;
using FluentAssertions;

namespace backend.Tests;

public class LocalizationContractTests
{
    private static readonly Guid UserId = Guid.Parse("00000000-0000-0000-0000-000000000001");
    private static readonly DateOnly Date = new(2026, 7, 13);

    [Fact]
    public void SelectGuidanceKey_ForSameUserAndDay_IsStableAcrossCalls()
    {
        var first = GuidanceSelector.SelectKey(
            UserId,
            Date,
            ECyclePhase.Menstruation,
            GuidanceType.DailyInsight);
        var second = GuidanceSelector.SelectKey(
            UserId,
            Date,
            ECyclePhase.Menstruation,
            GuidanceType.DailyInsight);

        first.Should().Be("guidance.insight.menstruation.restore");
        second.Should().Be(first);
    }

    [Fact]
    public void SelectGuidanceKey_UsesASeparateDailyFocusCatalogue()
    {
        var key = GuidanceSelector.SelectKey(
            UserId,
            Date,
            ECyclePhase.Menstruation,
            GuidanceType.DailyFocus);

        key.Should().Be("guidance.focus.menstruation.simplify");
    }

    [Theory]
    [InlineData(ECyclePhase.Menstruation, "menstruation")]
    [InlineData(ECyclePhase.Follicular, "follicular")]
    [InlineData(ECyclePhase.Ovulation, "ovulation")]
    [InlineData(ECyclePhase.Luteal, "luteal")]
    public void ToApiCode_ReturnsStableLowercasePhaseCode(
        ECyclePhase phase,
        string expectedCode)
    {
        CyclePhaseCodes.ToApiCode(phase).Should().Be(expectedCode);
    }

    [Theory]
    [InlineData(CycleRegularityLevel.Unknown, "unknown")]
    [InlineData(CycleRegularityLevel.Regular, "regular")]
    [InlineData(CycleRegularityLevel.Irregular, "irregular")]
    [InlineData(CycleRegularityLevel.VeryIrregular, "very_irregular")]
    public void ToApiCode_ReturnsStableLowercaseRegularityCode(
        CycleRegularityLevel level,
        string expectedCode)
    {
        CycleRegularityCodes.ToApiCode(level).Should().Be(expectedCode);
    }

    [Theory]
    [InlineData(1, "light")]
    [InlineData(2, "medium")]
    [InlineData(3, "heavy")]
    public void ToApiCode_ReturnsStableLowercaseFlowCode(
        int intensity,
        string expectedCode)
    {
        FlowIntensityCodes.ToApiCode(intensity).Should().Be(expectedCode);
    }
}
