namespace backend.Modulos.Symptoms.Models;

public class Symptom
{
    public int Id { get; set; }

    // Stable identifier used by the frontend.
    // Examples: headache, cramps, fatigue.
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;

    // Physical, mood, digestive, sleep, etc.
    public string Category { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<UserSymptomEntry> Entries { get; set; } = new List<UserSymptomEntry>();
}