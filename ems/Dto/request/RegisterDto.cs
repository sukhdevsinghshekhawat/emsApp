using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

namespace ems.Models
{
    public class RegisterDto
    {
        [Required]
        public string? Name { get; set; }

        [EmailAddress]
        [Required]
        public string? Email { get; set; }
        [Required]
        public int DepartmentId { get; set; }

        [Required]
        public string? PasswordHash { get; set; }

        [Compare("PasswordHash")]
        [Required]
        public string? ConfirmPasswordHash { get; set; }


    }
}