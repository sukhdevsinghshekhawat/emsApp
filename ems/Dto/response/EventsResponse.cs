
using System.ComponentModel.DataAnnotations;
using ems.Models;

namespace ems.Dto.response
{
    public class EventsResponse
    {
        public string? Message { get; set; }
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Venue { get; set; } = string.Empty;

        public List<DepartmentResponseDto> Departments { get; set; }
            = new List<DepartmentResponseDto>();

        public DateTime EventDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }
}
