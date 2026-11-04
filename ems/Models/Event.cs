
using System.ComponentModel.DataAnnotations;
using ems.Models;

namespace ems.Models
{
    public class Event
    {
        public int Id { get; set; }

        [Required]
        [StringLength(150)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Venue { get; set; } = string.Empty;

        [Required]
        public DateTime EventDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<DepartmentEvent> DepartmentEvents { get; set; } = new List<DepartmentEvent>();

        public ICollection<EventApplication> EventApplications{get;set;}=new List<EventApplication>();

    }
}

