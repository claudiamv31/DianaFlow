using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Modulos.Cycles.DTOs;
using backend.Modulos.Cycles.Services;


namespace backend.Modulos.Cycles.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/calendar")]
    public class CalendarController : ControllerBase
    {
        private readonly CalendarService _calendarService;

        public CalendarController(CalendarService calendarService)
        {
            _calendarService = calendarService ?? throw new ArgumentNullException(nameof(calendarService));
        }

        // GET /api/calendar?year=2026&month=1
        [HttpGet]
        public async Task<IActionResult> GetCalendar([FromQuery] int year, [FromQuery] int month)
        {
            var userId = HttpContext.User.FindFirst("sub")?.Value ?? HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized();

            var result = await _calendarService.GetCalendarAsync(userId, year, month);

            return Ok(result);
        }

         // GET /api/calendar/day?date=2026-01-01
        [HttpGet("day")]
        public async Task<IActionResult> GetCalendar([FromQuery] DateOnly date)
        {
            var userId = HttpContext.User.FindFirst("sub")?.Value ?? HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized();

            var result = await _calendarService.GetCalendarDayAsync(userId, date);

            return Ok(result);
        }

        [HttpPost("upsert")]
        public async Task<IActionResult> Upsert([FromBody] UpsertPeriodDto dto)
        {
            var startDate = dto.StartDate;
            var endDate = dto.EndDate;
            var flow  = dto.PeriodFlow;
            var periodId = dto.PeriodId;

            if (endDate < startDate)
            {
                return BadRequest("La fecha de fin no puede ser anterior a la fecha de inicio.");
            }

            try
            {
                var userId = HttpContext.User.FindFirst("sub")?.Value ?? HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                    return Unauthorized();
                    
                var result = await _calendarService.UpdateCalendar(userId, periodId, startDate, endDate, flow);

                return result == "created" 
                    ? StatusCode(201, new { message = "Período creado", status = "created" })
                    : Ok(new { message = "Período actualizado", status = "updated" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }

        }   
    }
}