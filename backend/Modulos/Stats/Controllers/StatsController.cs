using backend.Modulos.Stats.DTOs;
using backend.Modulos.Stats.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using backend.Api;

namespace backend.Modulos.Stats.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/stats")]
    public class StatsController : ControllerBase
    {
        private readonly StatsService _statsService;

        public StatsController(StatsService statsService)
        {
            _statsService = statsService ?? throw new ArgumentNullException(nameof(statsService));
        }

        [HttpGet("summary")]
        public async Task<ActionResult<StatsDto>> GetSummary()
        {
            try
            {
                var userIdString = HttpContext.User.FindFirst("sub")?.Value ?? HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized(new ApiError(ApiErrorCodes.NotAuthorized));

                var stats = await _statsService.GetStatsByUserId(userId);
                if (stats == null)
                    return NotFound(new ApiError(ApiErrorCodes.StatsNotFound));

                return Ok(stats);
            }
            catch (Exception)
            {
                return StatusCode(500, new ApiError(ApiErrorCodes.InternalError));
            }
        }
    }
}
