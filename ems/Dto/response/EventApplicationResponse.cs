using System.ComponentModel.DataAnnotations;

namespace ems.Dto
{
    public class EventApplicationResponse
    {
        public string Message { get; set; } = "Application submit";
        public int Id{get;set;}
        public int EventId{get;set;}
        public int UserId{get;set;}
        public string? UserName { get; set; }
        public int EventName { get; set; }

        public string Aadhar { get; set; } = string.Empty;
        public string Mobile { get; set; } = string.Empty;

        public string Status { get; set; } = "Pending";
    }
}