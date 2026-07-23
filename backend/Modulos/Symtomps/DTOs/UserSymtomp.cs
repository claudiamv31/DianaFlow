using backend.Modulos.Symptoms.Models;

namespace backend.Modulos.Symptoms.DTOs
{
    public class UserSymtomp
    {
        public Guid UserId { get; set; }
        public DateOnly Date { get; set; }
        public int SymptomId { get; set; }
        public SymtompSeverity Severity { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}