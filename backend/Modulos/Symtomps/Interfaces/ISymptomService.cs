namespace backend.Modulos.Symptoms.Interfaces;

using backend.Modulos.Symptoms.DTOs;
using backend.Modulos.Symptoms.Models;

public interface ISymptomService
{
    Task<List<Symptom>> GetAllSymptomsAsync();

    Task AddUserSymptomAsync(
        Guid userId,
        DateOnly date,
        SymtompSeverity severity,
        string? notes = null);

    Task RemoveUserSymptomAsync(
        Guid userId,
        DateOnly date,
        int symptomId);

    Task<List<UserSymptomEntry>> GetSymptomsForRangeAsync(
        Guid userId,
        DateOnly startDate,
        DateOnly endDate);
}