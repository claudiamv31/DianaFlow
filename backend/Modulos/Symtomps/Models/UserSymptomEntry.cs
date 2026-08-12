namespace backend.Modulos.Symptoms.Models;

using backend.Modulos.User.Models;
using backend.Modulos.Symptoms.DTOs;

public class UserSymptomEntry
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public int SymptomId { get; set; }
    // The calendar date experienced by the user.
    public DateOnly Date { get; set; }
    public SymtompSeverity Severity { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public User User { get; set; } = null!;
    public Symptom Symptom { get; set; } = null!;
}