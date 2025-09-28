using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPortalAPI.Models
{
    public class Employee
    {
        [Key]
        public int EmployeeID { get; set; }

        [Required]
        [StringLength(50)]
        public string CompanyName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [StringLength(50)]
        public string? MiddleName { get; set; }

        [Required]
        [StringLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        public bool FirstTimeFlag { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = string.Empty;

        // Foreign Keys
        [Required]
        public int IdentityID { get; set; }

        public int? VendorID { get; set; }

        // Navigation properties
        [ForeignKey("IdentityID")]
        public virtual Identity Identity { get; set; } = null!;

        [ForeignKey("VendorID")]
        public virtual Vendor Vendor { get; set; } = null!;

        public virtual ICollection<MasterTimeSheet> MasterTimeSheets { get; set; } = new List<MasterTimeSheet>();
        public virtual ICollection<EveryDayTimesheet> EveryDayTimesheets { get; set; } = new List<EveryDayTimesheet>();
    }
}