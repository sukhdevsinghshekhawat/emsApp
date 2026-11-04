namespace ems.Dto.response
{
    public class LoginResponseDto
    {
        public string? Message { get; set; }
        public string? AccessToken { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Department { get; set; }
        public string? Role { get; set; }
    }
}