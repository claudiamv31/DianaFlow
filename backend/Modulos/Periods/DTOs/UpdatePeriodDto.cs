namespace backend.Modulos.Periods.DTOs;

public class UpdatePeriodDto
{
    public List<DailyRecordInput> SelectedDays { get; set; } = new();
}

public class DailyRecordInput
{
    public DateOnly Date { get; set; }
    public int Flow { get; set; }
}