namespace ems.Dto
{
    public class ReviewApplicationDto
    {
        public int UserId { get; set; }
        public int EventId { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}