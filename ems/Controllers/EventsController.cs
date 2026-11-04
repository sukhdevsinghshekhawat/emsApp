using ems.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ems.Dto.request;
using ems.Dto.response;
using ems.Models;
using ems.Dto;
using Microsoft.AspNetCore.Authorization;

namespace ems.Controllers
{
    [ApiController]
    [Route("api/events")]
    public class EventsController : Controller
    {
        private readonly ApplicationDbContext _context;

        public EventsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("gets")]
        [Authorize(Roles = "Student,Teacher,Admin")]
        public async Task<ActionResult> GetAllEvents()
        {
            var events = await _context.Events.Include(e => e.DepartmentEvents).ThenInclude(de => de.Department).ToListAsync();

            if (events == null || events.Count == 0)
            {
                return NotFound("No events found.");
            }
            var response = events.Select(e => new EventsResponse
            {
                Message = "Events fetched successfully",
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                Venue = e.Venue,
                EventDate = e.EventDate,
                CreatedAt = e.CreatedAt,

                Departments = e.DepartmentEvents.Select(de =>
                    new DepartmentResponseDto
                    {
                        Id = de.Department.Id,
                        DepartmentName = de.Department.DepartmentName
                    }).ToList()

            }).ToList();

            return Ok(response);
        }

        [HttpPost("create")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<ActionResult> CreateEvent([FromBody] EventsDto dto)
        {
            if (dto == null)
            {
                return BadRequest("Invalid event data.");
            }

            if (dto.DepartmentIds == null || dto.DepartmentIds.Count == 0)
            {
                return BadRequest("Please select at least one department.");
            }

            var departments = await _context.Departments.Where(d => dto.DepartmentIds.Contains(d.Id)).ToListAsync();

            if (departments.Count != dto.DepartmentIds.Distinct().Count())
            {
                return BadRequest("Invalid Department IDs.");
            }

            var newEvent = new Event
            {
                Title = dto.Title,
                Description = dto.Description,
                Venue = dto.Venue,
                EventDate = dto.EventDate,
                CreatedAt = DateTime.UtcNow
            };

            // Start Transaction
            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                await _context.Events.AddAsync(newEvent);
                await _context.SaveChangesAsync();

                foreach (var department in departments)
                {
                    var departmentEvent = new DepartmentEvent
                    {
                        DepartmentId = department.Id,
                        EventId = newEvent.Id
                    };

                    _context.DepartmentEvents.Add(departmentEvent);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var response = new EventsResponse
                {
                    Message = "Event created successfully",
                    Id = newEvent.Id,
                    Title = newEvent.Title,
                    Venue = newEvent.Venue,
                    Description = newEvent.Description,
                    EventDate = newEvent.EventDate,
                    CreatedAt = newEvent.CreatedAt,

                    Departments = departments.Select(d => new DepartmentResponseDto
                    {
                        Id = d.Id,
                        DepartmentName = d?.DepartmentName ?? string.Empty
                    }).ToList()
                };

                return Ok(response);
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

        }

        [HttpPut("edit/{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<ActionResult> EditEvent(int id, [FromBody] EventsDto dto)
        {
            var existEvent = await _context.Events.FirstOrDefaultAsync(e => e.Id == id);

            if (existEvent == null)
            {
                return NotFound("Event not found");
            }

            if (dto.DepartmentIds == null || dto.DepartmentIds.Count == 0)
            {
                return BadRequest("Please select at least one department.");
            }

            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {

                // Update Event details
                existEvent.Title = dto.Title;
                existEvent.Description = dto.Description;
                existEvent.Venue = dto.Venue;
                existEvent.EventDate = dto.EventDate;

                await _context.SaveChangesAsync();

                // Find old relationships
                var oldDepartmentEvents = await _context.DepartmentEvents.Where(de => de.EventId == id).ToListAsync();

                // Remove old relationships
                _context.DepartmentEvents.RemoveRange(oldDepartmentEvents);
                await _context.SaveChangesAsync();

                // Find new departments
                var departments = await _context.Departments.Where(d => dto.DepartmentIds.Contains(d.Id)).ToListAsync();

                if (departments.Count != dto.DepartmentIds.Distinct().Count())
                {
                    return BadRequest("Invalid Department IDs.");
                }

                // Add new relationships
                foreach (var department in departments)
                {
                    var departmentEvent = new DepartmentEvent
                    {
                        EventId = id,
                        DepartmentId = department.Id
                    };

                    _context.DepartmentEvents.Add(departmentEvent);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok("Event updated successfully");

            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new
                {
                    message = ex.Message,
                    innerException = ex.InnerException?.Message
                });
            }
        }

        [HttpDelete("delete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteEvent(int id)
        {
            var existEvent = await _context.Events.FirstOrDefaultAsync(e => e.Id == id);

            if (existEvent == null)
            {
                return NotFound("Event not found");
            }
            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {

                var departmentEvents = await _context.DepartmentEvents.Where(de => de.EventId == id).ToListAsync();

                _context.DepartmentEvents.RemoveRange(departmentEvents);

                await _context.SaveChangesAsync();
                _context.Events.Remove(existEvent);

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok("Event deleted successfully");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new
                {
                    message = ex.Message,
                    innerException = ex.InnerException?.Message
                });
            }

        }

        [HttpGet("application/{eventId}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<ActionResult> GetApplications(int eventId)
        {
            var events = await _context.Events.AnyAsync(u => u.Id == eventId);
            if (!events)
            {
                return NotFound("Event not found");
            }

            var applications = await _context.EventApplications.Where(u => u.EventId == eventId).Include(u => u.User).ToListAsync();
            if (applications.Count == 0)
            {
                return Ok("No applications received for this event.");
            }
            var response = applications.Select(ea => new EventApplicationResponse
            {
                UserId = ea.UserId,
                EventId = ea.EventId,
                UserName = ea.User?.Name,
                Aadhar = ea.Aadhar,
                Mobile = ea.Mobile,
                Status = ea.Status
            });
            return Ok(response);
        }

    }
}