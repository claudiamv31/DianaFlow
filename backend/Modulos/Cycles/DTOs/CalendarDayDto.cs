using System.Collections.Generic;

namespace backend.Modulos.Cycles.DTOs
{
    public class CalendarDayDto
    {
        public string? PeriodId { get; set; }    
        public DateOnly Date { get; set; }
        public int CycleDay { get; set; }
        public bool IsPeriod { get; set; }
        public bool IsFertile { get; set; }
        public bool IsOvulation {get; set; }
        public string? Notes { get; set; }
        public string? FertilityLevel { get; set; } 
        public string? Phase { get; set; }
        public int PhaseDay { get; set; }
        public int PhaseLength { get; set; }
        public string? DailyInsight { get; set; }
        public int? Flow { get; set; }  
        public int? PeriodDaysId { get; set; }
    }
}
