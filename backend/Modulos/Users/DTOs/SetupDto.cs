namespace backend.Modulos.Users.DTOs
{
    public class SetupDto
    {
        /// <summary>First day of the user's last period (yyyy-MM-dd).</summary>
        public string LastDayPeriod { get; set; } = string.Empty;

        /// <summary>Average cycle length in days.</summary>
        public int DaysDurationOfCycle { get; set; }

        /// <summary>Average period duration in days.</summary>
        public int Duration { get; set; }
    }
}
