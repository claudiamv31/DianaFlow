using backend.Modulos.Periods.Models;
using System.Text.Json.Serialization;
using backend.Modulos.Cycles.Enums;

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

    public class CyclePhaseInfo
    {
        public ECyclePhase Phase { get; set; }
        public int CycleDay { get; set; }
        public int PhaseDay { get; set; }
        public int PhaseLength { get; set; }
        public int OvulationDay { get; set; }
    }

    public class CycleStatus
    {
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public int CycleLength { get; set; }
        public string Status { get; set; } = "unknown";
        public int CycleDay { get; set; }
        public int Days { get; set; }
        public int CurrentPeriodDay { get; set; }
        public int DaysLeftInPeriod { get; set; }
        public int? PeriodDuration { get; set; }
        public string FertilityLevel { get; set; } = "low";
        
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public CycleRegularityLevel Consistency { get; set; } = CycleRegularityLevel.Unknown;
    }

    public class UpsertPeriodDto
    {
        public string? PeriodId { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
    }
}
