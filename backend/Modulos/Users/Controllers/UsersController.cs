using backend.Data;
using Microsoft.AspNetCore.Authorization;
using backend.Modulos.Users.DTOs;
using backend.Modulos.Users.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Modulos.Users.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public UsersController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("sign-up")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            // Basic validation
            if (_context.UserProfiles.Any(u => u.Email == dto.Email))
            {
                return BadRequest(new { message = "The email is alredy in use." });
            }

            var userProfile = new UserProfile
            {
                Name = dto.Name,
                LastName = dto.LastName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
            };

            _context.UserProfiles.Add(userProfile);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User registered successfully" });
        }

        [HttpPost("login")]
        public IActionResult Login(LoginDto dto)
        {
            var user = _context.UserProfiles.FirstOrDefault(u => u.Email == dto.Email);
            
            if (user == null)
            {
                return NotFound(new { field = "email", message = "This email is not registered." });
            }

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                return Unauthorized(new { field = "password", message = "The password does not match this account." });
            }

            var token = GenerateJwtToken(user);
            return Ok(new { token });
        }

        private string GenerateJwtToken(UserProfile user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(4),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [HttpGet("profile")]
        public IActionResult GetProfile([FromBody] string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadJwtToken(token);
            var user = _context.UserProfiles.FirstOrDefault(u => u.Email == jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)!.Value);
            return Ok(user);
        }

        [HttpGet("me")]
        [Authorize] 
        public IActionResult GetCurrentUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            var user = _context.UserProfiles.FirstOrDefault(u => u.Id.ToString() == userId);
            
            if (user == null) return NotFound();

            return Ok(new {
                id = user.Id,
                email = user.Email,
                name = user.Name,
                lastName = user.LastName
            });
        }

        /// <summary>
        /// Initial cycle setup after registration. Creates the first period record
        /// from the wizard data (lastDayPeriod, daysDurationOfCycle, duration).
        /// </summary>
        [HttpPost("setup")]
        [Authorize]
        public async Task<IActionResult> Setup([FromBody] SetupDto dto)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdString, out Guid userId))
                return Unauthorized(new { message = "Not authorized" });

            if (string.IsNullOrWhiteSpace(dto.LastDayPeriod))
                return BadRequest(new { message = "lastDayPeriod is required." });

            if (!DateOnly.TryParse(dto.LastDayPeriod, out DateOnly startDate))
                return BadRequest(new { message = "lastDayPeriod must be a valid date (yyyy-MM-dd)." });

            int duration = dto.Duration > 0 ? dto.Duration : 5;
            var endDate = startDate.AddDays(duration - 1);

            var period = new backend.Modulos.Periods.Models.Periods
            {
                UserId = userId,
                StartDate = startDate,
                EndDate = endDate,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateOnly.FromDateTime(DateTime.UtcNow)
            };

            _context.Periods.Add(period);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Setup completed successfully", periodId = period.Id });
        }
    }
}
