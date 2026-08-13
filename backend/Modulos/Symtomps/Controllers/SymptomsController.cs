using System.Security.Claims;
using backend.Api;
using backend.Modulos.Symptoms.DTOs;
using backend.Modulos.Symptoms.Models;
using backend.Modulos.Symptoms.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Modulos.Symptoms.Controllers;

[ApiController]
[Authorize]
[Route("api/symptoms")]
public class SymptomsController : ControllerBase
{
    private readonly SymptomService _symptomService;
    public SymptomsController(SymptomService symptomService) => _symptomService = symptomService;

    [HttpGet("catalog")]
    public async Task<IActionResult> GetCatalog() => Ok((await _symptomService.GetAllSymptomsAsync()).Select(ToCatalogDto));

    [HttpGet]
    public async Task<IActionResult> GetForDate([FromQuery] DateOnly date)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized(new ApiError(ApiErrorCodes.NotAuthorized));
        return Ok((await _symptomService.GetSymptomsForRangeAsync(userId, date, date)).Select(ToUserDto));
    }

    [HttpPost("bulk")]
    public async Task<IActionResult> UpsertBulk([FromBody] BulkUserSymptomsDto dto)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized(new ApiError(ApiErrorCodes.NotAuthorized));
        if (dto.Date == default || dto.Symptoms.Count == 0) return BadRequest(new ApiError(ApiErrorCodes.InvalidRequest));
        foreach (var symptom in dto.Symptoms)
            await _symptomService.AddUserSymptomAsync(userId, dto.Date, symptom.SymptomId, symptom.Severity);
        return Ok((await _symptomService.GetSymptomsForRangeAsync(userId, dto.Date, dto.Date)).Select(ToUserDto));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpsertUserSymptomDto dto)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized(new ApiError(ApiErrorCodes.NotAuthorized));
        var entry = (await _symptomService.GetSymptomsForRangeAsync(userId, dto.Date, dto.Date)).FirstOrDefault(item => item.Id == id);
        if (entry == null) return NotFound(new ApiError(ApiErrorCodes.ResourceNotFound));
        await _symptomService.AddUserSymptomAsync(userId, dto.Date, entry.SymptomId, dto.Severity);
        return Ok((await _symptomService.GetSymptomsForRangeAsync(userId, dto.Date, dto.Date)).Select(ToUserDto));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, [FromQuery] DateOnly date)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized(new ApiError(ApiErrorCodes.NotAuthorized));
        var entry = (await _symptomService.GetSymptomsForRangeAsync(userId, date, date)).FirstOrDefault(item => item.Id == id);
        if (entry == null || !await _symptomService.RemoveUserSymptomAsync(userId, date, entry.SymptomId))
            return NotFound(new ApiError(ApiErrorCodes.ResourceNotFound));
        return NoContent();
    }

    private bool TryGetUserId(out Guid userId) => Guid.TryParse(User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out userId);
    private static SymptomCatalogDto ToCatalogDto(Symptom symptom) => new() { Id = symptom.Id, Code = symptom.Code, Category = symptom.Category, Icon = symptom.Icon, AllowsSeverity = symptom.AllowsSeverity };
    private static UserSymptomDto ToUserDto(UserSymptomEntry entry) => new() { Id = entry.Id, Date = entry.Date, SymptomId = entry.SymptomId, Code = entry.Symptom.Code, Category = entry.Symptom.Category, Icon = entry.Symptom.Icon, Severity = entry.Severity };
}
