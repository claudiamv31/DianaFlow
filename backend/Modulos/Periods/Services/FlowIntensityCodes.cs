namespace backend.Modulos.Periods.Services;

public static class FlowIntensityCodes
{
    public static string? ToApiCode(int intensity) => intensity switch
    {
        1 => "light",
        2 => "medium",
        3 => "heavy",
        _ => null
    };
}
