using System.ComponentModel.DataAnnotations;

namespace ems.Dto
{
    public class EventApplicationRwsponse
    {
        public string Message { get; set; } = "Application submit";
        [Required]
        public int UserName { get; set; }
        [Required]
        public int EventName { get; set; }

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