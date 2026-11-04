using Microsoft.AspNetCore.Mvc;
using ems.Data;
using ems.Dto.request;
using ems.Models;
using Microsoft.EntityFrameworkCore;
using ems.Services;
using ems.Dto.response;

namespace ems.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtService _jwtService;
        public AuthController(ApplicationDbContext context, JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<ActionResult> Register(RegisterDto rg)
        {

            if (rg == null)
            {
                return BadRequest("invalid data");
            }
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == rg.Email);
            if (existingUser != null)
            {
                return BadRequest(new { message = "email already exists" });
            }
            // Find default role
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Employee");

            if (role == null)
            {
                return BadRequest("Employee role not found");
            }
            var hashPassword = BCrypt.Net.BCrypt.HashPassword(rg.PasswordHash);

            var department = await _context.Departments.FirstOrDefaultAsync(d => d.Id == rg.DepartmentId);

            if (department == null)
            {
                return BadRequest("Invalid Department");
            }

            var user = new User
            {
                Name = rg.Name,
                Email = rg.Email,
                DepartmentId = department.Id,
                PasswordHash = hashPassword
            };
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                var userRole = new UserRole
                {
                    userId = user.Id,
                    roleId = role.Id
                };
                _context.UserRoles.Add(userRole);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();

                Console.WriteLine("MAIN ERROR: " + ex.Message);
                Console.WriteLine("INNER ERROR: " + ex.InnerException?.Message);

                return StatusCode(500, new
                {
                    message = ex.Message,
                    innerException = ex.InnerException?.Message
                });
            }

            var token = _jwtService.GenerateToken(user, role.RoleName);
            var response = new RegisterResponseDto
            {
                Message = "User created successfully",
                AccessToken = token,
                Name = user.Name,
                Email = user.Email,
                Department = department.DepartmentName,
                Role = role.RoleName
            };

            return Ok(response);
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login(LoginDto logindto)
        {
            if (logindto == null)
            {
                return Ok("user not found");
            }
            var existingUser = await _context.Users.Include(u => u.UserRoles).ThenInclude(u => u.Role).Include(u => u.Department).FirstOrDefaultAsync(u => u.Email == logindto.Email);
            if (existingUser == null)
            {
                return Unauthorized("Invalid email or password");
            }
            bool isValid = BCrypt.Net.BCrypt.Verify(logindto.PasswordHash, existingUser.PasswordHash);
            if (!isValid)
            {
                return Unauthorized("Sukhdev Invalid email or password");
            }

            var role = existingUser.UserRoles.Select(ur => ur.Role?.RoleName).FirstOrDefault();
            if (role == null)
            {
                return Unauthorized("User role not assigned");
            }
            var token = _jwtService.GenerateToken(existingUser, role);
            var response = new LoginResponseDto
            {
                Message = "User Found",
                AccessToken = token,
                Name = existingUser.Name,
                Email = existingUser.Email,
                Department = existingUser.Department?.DepartmentName,
                Role = role
            };
            return Ok(response);
        }

    }
}