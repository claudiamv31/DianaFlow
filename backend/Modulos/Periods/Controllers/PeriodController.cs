using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Modulos.Periods.Models;
using backend.Modulos.Periods.DTOs;
using backend.Modulos.Periods.Services;


namespace backend.Modulos.Periods.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/periods")]
    public class PeriodsController : ControllerBase
    {
        private readonly PeriodService _periodService;

        public PeriodsController(PeriodService periodService)
        {
            _periodService = periodService ?? throw new ArgumentNullException(nameof(periodService));
        }

        // POST api/periods
        [HttpPost]
        public async Task<IActionResult> CreatePeriod([FromBody] PeriodDto dto)
        {
            try
            {
                var userId = HttpContext.User.FindFirst("sub")?.Value ?? HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                    return Unauthorized();

                if (dto.StartDate == default || dto.EndDate == default)
                    return BadRequest("Fechas inválidas");
                            
                if (dto.EndDate < dto.StartDate)
                    return BadRequest("EndDate no puede ser menor a StartDate");

                await _periodService.AddPeriodAsync(
                    userId,
                    dto.StartDate,
                    dto.EndDate,
                    dto.PeriodFlow
                );

                return Created("", new { message = "Periodo guardado correctamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        // =======================
        // GET api/periods
        // =======================
        [HttpGet]
        public async Task<IActionResult> GetPeriods([FromQuery] int? year, [FromQuery] int? month, [FromQuery] int page = 1, [FromQuery] int pageSize = 5)
        {
            try
            {
                var userId = HttpContext.User.FindFirst("sub")?.Value ?? HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                    return Unauthorized();

                object? result = null;
                
                if(year.HasValue && month.HasValue)
                {   
                    result = await _periodService.GetPeriodsByMonthAsync(userId, year.Value, month.Value);
                }
                else if (year.HasValue)
                {
                    result = await _periodService.GetPeriodsByYearAsync(userId, year.Value);
                }
                else
                {
                    result = await _periodService.GetPeriodsPagination(userId, page, pageSize);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        // =======================
        // GET api/periods/latest
        // =======================
        [HttpGet("latest")]
        public async Task<IActionResult> GetLatestPeriod()
        {
            try
            {
                var userId = HttpContext.User.FindFirst("sub")?.Value ?? HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                    return Unauthorized();

                var period = await _periodService.GetLatestPeriodAsync(userId);
                if (period == null)
                    return NotFound("No periods found.");

                return Ok(period);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }
        
        [Authorize]
        [HttpGet("home")]
        public async Task<IActionResult> GetHome()
        {
            var claims = HttpContext.User.Claims.Select(c => c.Type + "=" + c.Value);
            Console.WriteLine("ALL CLAIMS: " + string.Join(", ", claims));

            var userId = HttpContext.User.FindFirst("sub")?.Value 
                         ?? HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
            Console.WriteLine("UserId in GetHome: " + (userId ?? "NULL"));  
            if (userId == null)
                return Unauthorized();

            var result = await _periodService.GetLatestForHomeAsync(userId);
            
            return Ok(result);
        }

        // =======================
        // PUT api/periods/{id}
        // =======================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePeriod(string id, [FromBody] PeriodDto dto)
        {
            try
            {
                var userId = HttpContext.User.FindFirst("sub")?.Value ?? HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                    return Unauthorized();

                if (dto.StartDate == default || dto.EndDate == default)
                    return BadRequest("Fechas inválidas");

                if (dto.EndDate < dto.StartDate)
                    return BadRequest("EndDate no puede ser menor a StartDate");

                var updated = await _periodService.UpdatePeriodAsync(
                    userId,
                    id,
                    dto.StartDate,
                    dto.EndDate,
                    dto.PeriodFlow
                );

                if (!updated)
                    return NotFound("Period not found.");

                return NoContent(); // 204
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        // =======================
        // DELETE api/periods/{id}
        // =======================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePeriod(string id)
        {
            try
            {
                var userId = HttpContext.User.FindFirst("sub")?.Value ?? HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                    return Unauthorized();

                var deleted = await _periodService.DeletePeriodAsync(userId, id);

                if (!deleted)
                    return NotFound("Period not found.");

                return NoContent(); // 204
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }
    }
}