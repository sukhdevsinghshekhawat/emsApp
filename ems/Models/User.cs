namespace ems.Models
{
    public class User
    {
        public int Id { get; set; }

        public string? Name { get; set; }

        public string? Email { get; set; }

        public string? PasswordHash { get; set; }

        public int DepartmentId { get; set; }

        // Navigation property h  Iski help se ham directly User ke Department ki details access kar sakte ho..
        public Department? Department { get; set; }

        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
        public ICollection<EventApplication> EventApplications { get; set; } = new List<EventApplication>();

    }
}