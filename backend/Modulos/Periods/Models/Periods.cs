namespace backend.Modulos.Periods.Models
{
    public class Periods
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public int Duration => (EndDate.DayNumber - StartDate.DayNumber);
        public PeriodFlow Flow { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateOnly UpdatedAt { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    }
}