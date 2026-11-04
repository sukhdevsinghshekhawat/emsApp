using System.Runtime.InteropServices;
using ems.Data;
using ems.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ems.Controllers
{
    [ApiController]
    [Route("api/user-roles")]
    public class UserRolesController : Controller
    {
        private readonly ApplicationDbContext _context;
        public UserRolesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPut("edit-role")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> EditRoles([FromBody] UserRoleDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == dto.UserId);

            if (user == null)
            {
                return NotFound("User not found");
            }

            var role = await _context.Roles
                .FirstOrDefaultAsync(r => r.Id == dto.RoleId);

            if (role == null)
            {
                return NotFound("Role not found");
            }

            var userRole = await _context.UserRoles
                .FirstOrDefaultAsync(ur => ur.userId == dto.UserId);

            if (userRole == null)
            {
                return NotFound("User role not found");
            }

            userRole.roleId = dto.RoleId;

            await _context.SaveChangesAsync();

            return Ok("User role updated successfully");
        }
    }
}