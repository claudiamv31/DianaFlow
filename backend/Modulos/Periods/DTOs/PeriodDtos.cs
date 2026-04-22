using System;
using backend.Modulos.Periods.Models;
using backend.Modulos.Cycles.DTOs;
using System.Text.Json.Serialization;

namespace backend.Modulos.Periods.DTOs
{
    public class PeriodDto
    {
        public string Id { get; set; } = string.Empty;
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public PeriodFlow PeriodFlow { get; set; }
    }

    public class PeriodHomeDto
    {
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public int DurationDays { get; set; }
        public bool IsActive { get; set; }
        public int CycleDay { get; set; }
        
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public ECyclePhase CurrentPhase {get; set;}

        public PeriodStatus? PreviousCycle { get; set; }
        public PeriodStatus CycleStatus { get; set; } = new();
    }

    public class PeriodStatus
    {
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public int CycleLength { get; set; }
        public CycleRegularityLevel RegularityLevel { get; set; }
        public string Status { get; set; } = string.Empty;
        public int Days { get; set; } // for days delayed, days left, etc
    }

    public enum CycleRegularityLevel
    {
        Unknown,
        VeryRegular,
        Regular,
        Irregular,
        VeryIrregular
    }

    public class SummaryDto
    {
        public int TotalPeriods { get; set; }
        public double AvgCycleLength { get; set; }
        public double AvgPeriodLength { get; set; }
        public string LastPeriodStart { get; set; } = string.Empty;
        public double MinCycleLength { get; set; }
        public double MaxCycleLength { get; set; }
        public CycleRegularityLevel CycleRegularity { get; set; }
    }
}
