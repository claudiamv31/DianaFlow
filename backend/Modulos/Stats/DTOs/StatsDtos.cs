using backend.Modulos.Periods.DTOs;

namespace backend.Modulos.Stats.DTOs
{
    public class StatsDto
    {
        public List<PeriodDto>? Periods { get; set; }
        public int? AverageCycleLength { get; set; }
        public int? AveragePeriodLength { get; set; }
        public DateOnly? NextPeriodStart { get; set; }
        public DateOnly? NextPeriodEnd { get; set; }
        public int? Regularity { get; set; }
    }
}