using System.ComponentModel.DataAnnotations;

namespace CNPortalAPI.Models
{
    public class Identity
    {
        [Key]
        public int IdentityID { get; set; }

        [Required]
        [StringLength(10)]
        public string Role { get; set; } = string.Empty;

        // Navigation property
        public virtual ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }
}