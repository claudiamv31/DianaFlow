namespace backend.Modulos.Periods.Models;

public class UpdatePeriodDto
{
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public DateOnly UpdatedAt { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);   
}