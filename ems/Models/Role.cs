namespace ems.Models
{
    public class Role
    {
        public int Id { get; set; }

        public string? RoleName { get; set; }

        public ICollection<UserRole> UserRoles { get; set; }
        = new List<UserRole>();
    }
}