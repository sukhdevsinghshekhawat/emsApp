
using System.ComponentModel.DataAnnotations;
using ems.Models;

namespace ems.Dto.request
{
    public class EventsDto
    {

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
        public List<int> DepartmentIds { get; set; }

        [Required]
        public DateTime EventDate { get; set; }

    }

    
}
