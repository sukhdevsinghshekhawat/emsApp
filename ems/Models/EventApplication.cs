using System.ComponentModel.DataAnnotations;
using ems.Models;

namespace ems.Models
{
    public class EventApplication
    {  
        public int Id {get;set;}
        public int UserId { get; set; }
        public User? User { get; set; }
        public int EventId { get; set; }
        public Event? Event { get; set; }

        [Required]
        [MinLength(12)]
        [MaxLength(12)]
        public string Aadhar { get; set; } = string.Empty;
        [Required]
        [MinLength(10)]
        [MaxLength(10)]
        public string Mobile { get; set; } = string.Empty;

        public string Status {get;set;}="Pending";
    }
}