using ems.Data;
using ems.Dto.response;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ems.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UsersController : Controller
    {
        private readonly ApplicationDbContext _context;
        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> GetUsers()
        {
            var users = await _context.Users.Include(r => r.UserRoles).ThenInclude(ur => ur.Role).ToListAsync();
            if (users == null)
            {
                return NotFound("User Not Foound");
            }
            var response = users.Select(s => new UserResponseDto
            {
                Name = s.Name,
                Email = s.Email,
                UserId = s.Id,
                Role = s.UserRoles.FirstOrDefault()?.Role?.RoleName

            });

            return Ok(response);
        }
    }
}