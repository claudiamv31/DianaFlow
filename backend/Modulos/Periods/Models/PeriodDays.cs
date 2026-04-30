namespace backend.Modulos.Periods.Models
{
    public class PeriodDays
    {
        public int Id { get; set; }
        public int PeriodId { get; set; }
        public DateOnly Date { get; set; }
        public string Notes { get; set; } = string.Empty;
        public int Flow { get; set; }
        public Periods? Periods { get; set; } = null;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}