using System.ComponentModel.DataAnnotations;

namespace ems.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "name is required")]
        public string? Name { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Please enter a valid email address")]
        public string? Email { get; set; }

        [Required]
        public string? PasswordHash { get; set; }

        public int DepartmentId { get; set; }

        // Navigation property h  Iski help se ham directly User ke Department ki details access kar sakte ho..
        public Department? Department { get; set; }

        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
        public ICollection<EventApplication> EventApplications { get; set; } = new List<EventApplication>();

    }
}