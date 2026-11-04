using ems.Data;
using ems.Dto;
using ems.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ems.Controllers
{
    [ApiController]
    [Route("api/applications")]
    public class EventApplicationsController : Controller
    {
        private readonly ApplicationDbContext _context;


        public EventApplicationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("create")]
        public async Task<ActionResult> Create([FromBody] EventApplicationDto dto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.UserId);

            var events = await _context.Events.FirstOrDefaultAsync(e => e.Id == dto.EventId);
            if (user == null || events == null)
            {
                return BadRequest("invalid ID");
            }

            var apply = new EventApplication
            {
                Aadhar = dto.Aadhar,
                Mobile = dto.Mobile,
                UserId = dto.UserId,
                EventId = dto.EventId,
                Status = dto.Status
            };
            await _context.AddAsync(apply);
            await _context.SaveChangesAsync();
            var response = new EventApplicationRwsponse
            {
                Message = "Application submited",
                Status = dto.Status
            };

            return Ok(response);
        }

    }
}