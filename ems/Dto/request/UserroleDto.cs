using System.ComponentModel.DataAnnotations;

namespace ems.Dto
{
    public class UserRoleDto
    {
        [Required]
        public int UserId { get; set; }
        [Required]
        public int RoleId { get; set; }

    }
}