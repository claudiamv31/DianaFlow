using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Modulos.Cycles.DTOs;
using backend.Modulos.Cycles.Services;
using backend.Modulos.Periods.DTOs;
using backend.Api;

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
            try{
                var userIdString = HttpContext.User.FindFirst("sub")?.Value ?? HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized(new ApiError(ApiErrorCodes.NotAuthorized));

                var result = await _calendarService.GetCalendarAsync(userId, year, month);

                if(result == null)
                    return NotFound(new ApiError(ApiErrorCodes.PeriodsNotFound));

                return Ok(result);
            }
            catch (Exception)
            {
                return StatusCode(500, new ApiError(ApiErrorCodes.InternalError));
            }
        }

         // GET /api/calendar/day?date=2026-01-01
        [HttpGet("day")]
        public async Task<IActionResult> GetCalendar([FromQuery] DateOnly date)
        {
            var userIdString = HttpContext.User.FindFirst("sub")?.Value ?? HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized(new ApiError(ApiErrorCodes.NotAuthorized));

            var result = await _calendarService.GetCalendarDayAsync(userId, date);

            return Ok(result);
        }

        [HttpPost("upsert")]
        public async Task<IActionResult> Upsert([FromBody] PeriodInputDto dto)
        {

            try
            {
                var userIdString = HttpContext.User.FindFirst("sub")?.Value ?? HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized(new ApiError(ApiErrorCodes.NotAuthorized));
                    
                var result = await _calendarService.UpdateCalendar(userId, dto);

                return result == "created" 
                    ? StatusCode(201, new { message = "Período creado", status = "created" })
                    : Ok(new { message = "Período actualizado", status = "updated" });
            }
            catch (Exception)
            {
                return StatusCode(500, new ApiError(ApiErrorCodes.CalendarUpdateFailed));
            }

        }   
    }
}
