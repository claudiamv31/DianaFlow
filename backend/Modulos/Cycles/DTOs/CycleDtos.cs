using backend.Modulos.Periods.Models;

namespace backend.Modulos.Cycles.DTOs
{
    public class SymptomsDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int Severity { get; set; }
    }

    public class CycleInfo
    {
        public int CycleDay { get; set; }
        public bool IsFertile { get; set; }
        public bool IsOvulation { get; set; }
        public string FertilityLevel { get; set; } = "low";
    }

    public enum ECyclePhase
    {
        Menstruation,
        Follicular,
        Ovulation,
        Luteal
    }

    public class UpsertPeriodDto
    {
        public string? PeriodId { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public PeriodFlow PeriodFlow { get; set; }
    }
}
