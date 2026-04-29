using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Modulos.Periods.Models
{
    public class Periods
    {
        public int Id { get; set; }
        public Guid UserId { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        [NotMapped]
        public bool IsActive => !EndDate.HasValue || EndDate.Value >= DateOnly.FromDateTime(DateTime.UtcNow);
        [NotMapped]
        public int? Duration => EndDate.HasValue ? (EndDate.Value.DayNumber - StartDate.DayNumber) + 1 : null;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateOnly UpdatedAt { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    }
}