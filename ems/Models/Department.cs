namespace ems.Models
{
    public class Department
    {
        public int Id { get; set; }
        public string? DepartmentName { get; set; }

        public ICollection<User> Users { get; set; } = new List<User>();

        // Many-to-Many relationship
        public ICollection<DepartmentEvent> DepartmentEvents { get; set; } = new List<DepartmentEvent>();


    }
}