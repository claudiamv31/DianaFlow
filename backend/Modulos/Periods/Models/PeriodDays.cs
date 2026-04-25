namespace backend.Modulos.Periods.Models
{
    public class PeriodDays
    {
        public int Id { get; set; }
        public int PeriodId { get; set; }
        public DateTime Date { get; set; }
        public string Notes { get; set; } = string.Empty;
        public int Flow { get; set; }
        public Periods? Periods { get; set; } = null;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateOnly UpdatedAt { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    }
}