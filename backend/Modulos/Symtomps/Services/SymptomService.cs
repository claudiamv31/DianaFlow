using backend.Data;
using backend.Modulos.Symptoms.DTOs;
using backend.Modulos.Symptoms.Interfaces;
using backend.Modulos.Symptoms.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Modulos.Symptoms.Services;

public class SymptomService : ISymptomService
{
    private readonly AppDbContext _context;

    public SymptomService(AppDbContext context) => _context = context;

    public virtual Task<List<Symptom>> GetAllSymptomsAsync() => _context.Symptoms
        .AsNoTracking().Where(symptom => symptom.IsActive).OrderBy(symptom => symptom.SortOrder).ToListAsync();

    public virtual async Task AddUserSymptomAsync(Guid userId, DateOnly date, int symptomId, SymtompSeverity severity, string? notes = null)
    {
        var existingEntry = await _context.UserSymptomEntries.FirstOrDefaultAsync(
            entry => entry.UserId == userId && entry.Date == date && entry.SymptomId == symptomId);

        if (existingEntry == null)
        {
            _context.UserSymptomEntries.Add(new UserSymptomEntry
            {
                UserId = userId, Date = date, SymptomId = symptomId, Severity = severity, Notes = notes
            });
        }
        else
        {
            existingEntry.Severity = severity;
            existingEntry.Notes = notes;
            existingEntry.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }

    public virtual async Task<bool> RemoveUserSymptomAsync(Guid userId, DateOnly date, int symptomId)
    {
        var entry = await _context.UserSymptomEntries.FirstOrDefaultAsync(
            item => item.UserId == userId && item.Date == date && item.SymptomId == symptomId);
        if (entry == null) return false;
        _context.UserSymptomEntries.Remove(entry);
        await _context.SaveChangesAsync();
        return true;
    }

    public virtual Task<List<UserSymptomEntry>> GetSymptomsForRangeAsync(Guid userId, DateOnly startDate, DateOnly endDate) =>
        _context.UserSymptomEntries.AsNoTracking().Include(entry => entry.Symptom)
            .Where(entry => entry.UserId == userId && entry.Date >= startDate && entry.Date <= endDate)
            .OrderBy(entry => entry.Date).ThenBy(entry => entry.Symptom.SortOrder).ToListAsync();
}
