using System.ComponentModel.DataAnnotations;

namespace ems.Dto
{
    public class EventApplicationDto
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public int EventId { get; set; }

        [Required]
        [MinLength(12)]
        [MaxLength(12)]

        public string Aadhar { get; set; } = string.Empty;
        [Required]
        [MinLength(10)]
        [MaxLength(10)]
        public string Mobile { get; set; } = string.Empty;

        public string Status { get; set; } = "Pending";
    }
}