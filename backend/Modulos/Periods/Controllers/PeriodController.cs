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
        public async Task<IActionResult> CreatePeriod([FromBody] PeriodInputDto dto)
        {
            Console.WriteLine("CreatePeriod");
            try
            {
                var userIdString = HttpContext.User.FindFirst("sub")?.Value ?? HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized();

                if (dto.SelectedDays == null || !dto.SelectedDays.Any())
                    return BadRequest("Debe seleccionar al menos un día.");

                var sortedDays = dto.SelectedDays.OrderBy(d => d.Date).ToList();
                var startDate = sortedDays.First().Date;
                var endDate = sortedDays.Last().Date;

                if (startDate == default)
                    return BadRequest("La fecha de inicio es requerida.");
                            
                if (endDate < startDate)
                    return BadRequest("La fecha de fin no puede ser menor a la de inicio.");

                await _periodService.AddPeriodAsync(userId,dto);

                return Created("", new { message = "Periodo guardado correctamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
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
                var userIdString = HttpContext.User.FindFirst("sub")?.Value ?? HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized();

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
                return StatusCode(500, $"Internal server error: {ex.Message}");
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
                var userIdString = HttpContext.User.FindFirst("sub")?.Value ?? HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized();

                var period = await _periodService.GetLatestPeriodAsync(userId);
                if (period == null)
                    return NotFound("No periods found.");

                return Ok(period);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("next")]
        public async Task<IActionResult> GetNextPeriod()
        {
            try
            {
                var userIdString = HttpContext.User.FindFirst("sub")?.Value ?? HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized();

                var period = await _periodService.GetNextPeriodPredictionAsync(userId);
                if (period == null)
                    return NotFound("No period found.");

                return Ok(period);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        
        [Authorize]
        [HttpGet("home")]
        public async Task<IActionResult> GetHome()
        {
            var claims = HttpContext.User.Claims.Select(c => c.Type + "=" + c.Value);
            Console.WriteLine("ALL CLAIMS: " + string.Join(", ", claims));

            var userIdString = HttpContext.User.FindFirst("sub")?.Value 
                         ?? HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
            Console.WriteLine("UserId in GetHome: " + (userIdString ?? "NULL"));  
            if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized();

            var result = await _periodService.GetLatestForHomeAsync(userId);
            
            return Ok(result);
        }

        // =======================
        // PUT api/periods
        // =======================
        [HttpPut]
        public async Task<IActionResult> UpdatePeriod([FromBody] PeriodInputDto dto)
        {
            try
            {
                if(dto.PeriodId == null)
                    return BadRequest("Period ID is required.");

                var userIdString = HttpContext.User.FindFirst("sub")?.Value ?? HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized();

                var updated = await _periodService.UpdatePeriod(userId, dto);

                if (!updated)
                    return NotFound("Period not found.");

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // =======================
        // PUT api/periods/day
        // =======================
        [HttpPut("day")]
        public async Task<IActionResult> UpdatePeriodDay([FromBody] DailyRecordInput dto)
        {
            try
            {
                if (dto.Date == default)
                    return BadRequest("Date is required.");

                var userIdString = HttpContext.User.FindFirst("sub")?.Value ?? HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized();

                var updated = await _periodService.UpdatePeriodDayAsync(userId, dto);

                if (!updated)
                    return StatusCode(500, "Could not update period day.");

                return Ok(new { message = "Daily log updated successfully", data = dto });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
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
                var userIdString = HttpContext.User.FindFirst("sub")?.Value ?? HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized();

                var deleted = await _periodService.DeletePeriodAsync(userId, id);

                if (!deleted)
                    return NotFound("Period not found.");

                return NoContent(); // 204
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}