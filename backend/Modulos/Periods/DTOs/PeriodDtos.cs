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
        public DateOnly? EndDate { get; set; }
        public bool IsActive { get; set; }
        public int? Duration { get; set; }
    }

    public class PeriodInputDto
    {
        public int? PeriodId { get; set; }
        public List<DailyRecordInput> SelectedDays { get; set; } = new();
    }

    public class DailyRecordInput
    {
        public DateOnly Date { get; set; }
        public int Flow { get; set; }
    }

    public class PeriodHomeDto
    {
        public int? PeriodId { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public int DurationDays { get; set; }
        public bool IsActive { get; set; }
        public int DaysUntilNextPeriod { get; set; }
        
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public ECyclePhase CurrentPhase {get; set;}

        public CycleStatus? PreviousCycle { get; set; }
        public CycleStatus CycleStatus { get; set; } = new();
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
