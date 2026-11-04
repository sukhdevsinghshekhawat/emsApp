namespace ems.Models
{
    public class UserRole
    {
        public int userId { get; set; }

        public User? User { get; set; }

        public int roleId { get; set; }

        public Role? Role { get; set; }
    }
}