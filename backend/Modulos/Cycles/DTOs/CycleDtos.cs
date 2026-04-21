namespace backend.Modulos.Cycles.DTOs
{
    public class SymptomsDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int Severity { get; set; }
    }

    public class CycleInfo
    {
        public int CycleDay { get; set; }
        public bool IsFertile { get; set; }
        public bool IsOvulation { get; set; }
        public string FertilityLevel { get; set; } = "low";
    }
}
