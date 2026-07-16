using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Modulos.Periods.Models;
using backend.Modulos.Periods.DTOs;
using backend.Modulos.Periods.Services;
using backend.Api;


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
                if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized(new ApiError(ApiErrorCodes.NotAuthorized));

                if (dto.SelectedDays == null || !dto.SelectedDays.Any())
                    return BadRequest(new ApiError(ApiErrorCodes.PeriodDaysRequired, "selectedDays"));

                var sortedDays = dto.SelectedDays.OrderBy(d => d.Date).ToList();
                var startDate = sortedDays.First().Date;
                var endDate = sortedDays.Last().Date;

                if (startDate == default)
                    return BadRequest(new ApiError(ApiErrorCodes.PeriodStartRequired, "startDate"));
                            
                if (endDate < startDate)
                    return BadRequest(new ApiError(ApiErrorCodes.PeriodStartRequired, "endDate"));

                await _periodService.AddPeriodAsync(userId,dto);

                return Created("", new { message = "Periodo guardado correctamente" });
            }
            catch (Exception)
            {
                return StatusCode(500, new ApiError(ApiErrorCodes.InternalError));
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
                if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized(new ApiError(ApiErrorCodes.NotAuthorized));

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
            catch (Exception)
            {
                return StatusCode(500, new ApiError(ApiErrorCodes.InternalError));
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
                if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized(new ApiError(ApiErrorCodes.NotAuthorized));

                var period = await _periodService.GetLatestPeriodAsync(userId);
                if (period == null)
                    return NotFound(new ApiError(ApiErrorCodes.PeriodsNotFound));

                return Ok(period);
            }
            catch (Exception)
            {
                return StatusCode(500, new ApiError(ApiErrorCodes.InternalError));
            }
        }

        [HttpGet("next")]
        public async Task<IActionResult> GetNextPeriod()
        {
            try
            {
                var userIdString = HttpContext.User.FindFirst("sub")?.Value ?? HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized(new ApiError(ApiErrorCodes.NotAuthorized));

                var period = await _periodService.GetNextPeriodPredictionAsync(userId);
                if (period == null)
                    return NotFound(new ApiError(ApiErrorCodes.PeriodNotFound));

                return Ok(period);
            }
            catch (Exception)
            {
                return StatusCode(500, new ApiError(ApiErrorCodes.InternalError));
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
            if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized(new ApiError(ApiErrorCodes.NotAuthorized));

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
                    return BadRequest(new ApiError(ApiErrorCodes.PeriodIdRequired, "periodId"));

                var userIdString = HttpContext.User.FindFirst("sub")?.Value ?? HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized(new ApiError(ApiErrorCodes.NotAuthorized));

                var updated = await _periodService.UpdatePeriod(userId, dto);

                if (!updated)
                    return NotFound(new ApiError(ApiErrorCodes.PeriodNotFound));

                return Ok(dto);
            }
            catch (Exception)
            {
                return StatusCode(500, new ApiError(ApiErrorCodes.InternalError));
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
                    return BadRequest(new ApiError(ApiErrorCodes.DateRequired, "date"));

                var userIdString = HttpContext.User.FindFirst("sub")?.Value ?? HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized(new ApiError(ApiErrorCodes.NotAuthorized));

                var updated = await _periodService.UpdatePeriodDayAsync(userId, dto);

                if (!updated)
                    return StatusCode(500, new ApiError(ApiErrorCodes.PeriodUpdateFailed));

                return Ok(new { message = "Daily log updated successfully", data = dto });
            }
            catch (Exception)
            {
                return StatusCode(500, new ApiError(ApiErrorCodes.InternalError));
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
                if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized(new ApiError(ApiErrorCodes.NotAuthorized));

                var deleted = await _periodService.DeletePeriodAsync(userId, id);

                if (!deleted)
                    return NotFound(new ApiError(ApiErrorCodes.PeriodNotFound));

                return NoContent(); // 204
            }
            catch (Exception)
            {
                return StatusCode(500, new ApiError(ApiErrorCodes.InternalError));
            }
        }
    }
}
