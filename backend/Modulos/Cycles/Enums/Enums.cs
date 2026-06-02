public enum ECyclePhase
{
    Menstruation,
    Follicular,
    Ovulation,
    Luteal
}

public enum CycleRegularityLevel
{
    Unknown,
    Regular,
    Irregular,
    VeryIrregular
}

public enum EPhaseMessageType
{
    Short = 0,   // Used in the calendar daily insight
    Focus = 1    // Used in the "Your Focus" card on the home page
}