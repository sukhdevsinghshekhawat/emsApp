using System.Security.Claims;
using ems.Data;
using ems.Dto;
using ems.Models;
using Microsoft.AspNetCore.Authorization;
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
        [Authorize(Roles = "Student")]
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
            var response = new EventApplicationResponse
            {
                Message = "Application submited",
                Status = dto.Status
            };

            return Ok(response);
        }

        [HttpGet("myapplication/{userId}")]
        [Authorize(Roles = "Student")]
        public async Task<ActionResult> GetMyApplication(int userId)
        {

            var applications = await _context.EventApplications.Where(ea => ea.UserId == userId).Include(ea => ea.Event).ToListAsync();
            var response = applications.Select(ea => new MyApplicationResponseDto
            {
                Title = ea.Event?.Title,
                Venue = ea.Event?.Venue,
                EventDate = ea.Event.EventDate,
                Status = ea.Status
            }).ToList();

            return Ok(response);
        }

        [HttpPut("review")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<ActionResult> ApplicationEdit([FromBody] ReviewApplicationDto dto)
        {
            var application = await _context.EventApplications
                .FirstOrDefaultAsync(a =>
                    a.UserId == dto.UserId && a.EventId == dto.EventId);

            if (application == null)
            {
                return NotFound("Application not found");
            }

            if (dto.Status != "Approved" && dto.Status != "Rejected")
            {
                return BadRequest("Invalid status.");
            }

            application.Status = dto.Status;

            await _context.SaveChangesAsync();

            return Ok("Application status updated successfully");
        }

    }
}