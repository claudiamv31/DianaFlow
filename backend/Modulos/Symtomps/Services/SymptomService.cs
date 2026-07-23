using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Modulos.Symptoms.Models;
using backend.Modulos.Symptoms.DTOs;

namespace backend.Modulos.Symptoms.Services
{
    public class SymptomService
    {
        private readonly AppDbContext _context;

        public SymptomService(AppDbContext context)
        {
            _context = context;
        }

        public virtual async Task<List<Symptom>> GetAllSymptomsAsync()
        {
            var symptoms = await _context.Symptoms
                .AsNoTracking()
                .ToListAsync();

            return symptoms;
        }

        public virtual async Task<bool> AddUserSymptomAsync(
            Guid userId,
            DateOnly date,
            int symptomId,
            SymtompSeverity severity,
            string? notes = null)
        {
            var existingEntry = await _context.UserSymptomEntries.FirstOrDefaultAsync(
                s => s.UserId == userId && s.Date == date && s.SymptomId == symptomId);

            if (existingEntry != null)
            {
                existingEntry.Severity = severity;
                existingEntry.Notes = notes ?? existingEntry.Notes;
            _context.UserSymptomEntries.Update(existingEntry);
        }
        else
        {
            _context.UserSymptomEntries.Add(new UserSymptomEntry
            {
                UserId = userId,
                Date = date,
                SymptomId = symptomId,
                Severity = severity,
                Notes = notes
            });
        }
        await _context.SaveChangesAsync();
        return true;
        }

        public virtual async Task<bool> RemoveUserSymptomAsync(
            Guid userId,
            DateOnly date,
            int symptomId)
        {
            var symptom = await _context.UserSymptomEntries.FirstOrDefaultAsync(s => s.UserId == userId && s.Date == date && s.SymptomId == symptomId);
            if (symptom == null) return false;

            _context.UserSymptomEntries.Remove(symptom);
            await _context.SaveChangesAsync();
            return true;
        }
            
    }
}
