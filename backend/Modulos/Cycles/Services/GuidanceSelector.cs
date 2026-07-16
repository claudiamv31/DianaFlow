using System.Security.Cryptography;
using System.Text;
using backend.Modulos.Cycles.Enums;

namespace backend.Modulos.Cycles.Services;

public static class CyclePhaseCodes
{
    public static string ToApiCode(ECyclePhase phase) => phase switch
    {
        ECyclePhase.Menstruation => "menstruation",
        ECyclePhase.Follicular => "follicular",
        ECyclePhase.Ovulation => "ovulation",
        ECyclePhase.Luteal => "luteal",
        _ => throw new ArgumentOutOfRangeException(nameof(phase), phase, null)
    };
}

public static class CycleRegularityCodes
{
    public static string ToApiCode(CycleRegularityLevel level) => level switch
    {
        CycleRegularityLevel.Unknown => "unknown",
        CycleRegularityLevel.Regular => "regular",
        CycleRegularityLevel.Irregular => "irregular",
        CycleRegularityLevel.VeryIrregular => "very_irregular",
        _ => throw new ArgumentOutOfRangeException(nameof(level), level, null)
    };
}

public static class GuidanceSelector
{
    private static readonly IReadOnlyDictionary<(GuidanceType Type, ECyclePhase Phase), string[]> Keys =
        new Dictionary<(GuidanceType, ECyclePhase), string[]>
        {
            [(GuidanceType.DailyInsight, ECyclePhase.Menstruation)] =
                ["guidance.insight.menstruation.restore", "guidance.insight.menstruation.checkIn"],
            [(GuidanceType.DailyInsight, ECyclePhase.Follicular)] =
                ["guidance.insight.follicular.explore", "guidance.insight.follicular.plan"],
            [(GuidanceType.DailyInsight, ECyclePhase.Ovulation)] =
                ["guidance.insight.ovulation.connect", "guidance.insight.ovulation.communicate"],
            [(GuidanceType.DailyInsight, ECyclePhase.Luteal)] =
                ["guidance.insight.luteal.finish", "guidance.insight.luteal.protect"],
            [(GuidanceType.DailyFocus, ECyclePhase.Menstruation)] =
                ["guidance.focus.menstruation.reflect", "guidance.focus.menstruation.simplify"],
            [(GuidanceType.DailyFocus, ECyclePhase.Follicular)] =
                ["guidance.focus.follicular.learn", "guidance.focus.follicular.begin"],
            [(GuidanceType.DailyFocus, ECyclePhase.Ovulation)] =
                ["guidance.focus.ovulation.present", "guidance.focus.ovulation.connect"],
            [(GuidanceType.DailyFocus, ECyclePhase.Luteal)] =
                ["guidance.focus.luteal.refine", "guidance.focus.luteal.complete"]
        };

    public static IReadOnlyCollection<string> AllKeys => Keys.Values.SelectMany(value => value).ToArray();

    public static string SelectKey(
        Guid userId,
        DateOnly localDate,
        ECyclePhase phase,
        GuidanceType type)
    {
        var typeCode = type == GuidanceType.DailyFocus ? "focus" : "insight";
        var seed = $"{userId:D}|{localDate:yyyy-MM-dd}|{CyclePhaseCodes.ToApiCode(phase)}|{typeCode}";
        var digest = SHA256.HashData(Encoding.UTF8.GetBytes(seed));
        var candidates = Keys[(type, phase)];

        return candidates[digest[0] % candidates.Length];
    }
}
