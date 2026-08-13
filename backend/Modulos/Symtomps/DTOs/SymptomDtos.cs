namespace backend.Modulos.Symptoms.DTOs;

public sealed class SymptomCatalogDto
{
    public int Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string? Icon { get; init; }
    public bool AllowsSeverity { get; init; }
}

public sealed class UserSymptomDto
{
    public Guid Id { get; init; }
    public DateOnly Date { get; init; }
    public int SymptomId { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Category { get; init; } = string.Empty;
    public string? Icon { get; init; }
    public SymtompSeverity? Severity { get; init; }
}

public sealed class UpsertUserSymptomDto
{
    public DateOnly Date { get; init; }
    public int SymptomId { get; init; }
    public SymtompSeverity? Severity { get; init; }
}

public sealed class BulkUserSymptomsDto
{
    public DateOnly Date { get; init; }
    public List<UpsertUserSymptomDto> Symptoms { get; init; } = [];
}
