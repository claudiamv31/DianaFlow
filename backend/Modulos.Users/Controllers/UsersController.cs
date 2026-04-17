using backend.Data;
using backend.Modulos.Users.DTOs;
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
                return BadRequest(new { message = "El correo ya está registrado." });
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

            return Ok(new { message = "Usuario registrado exitosamente" });
        }

        [HttpPost("login")]
        public IActionResult Login(LoginDto dto)
        {
            var user = _context.UserProfiles.FirstOrDefault(u => u.Email == dto.Email);
            
            // Validate user exists and password hash matches
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Credenciales inválidas" });
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
    }
}