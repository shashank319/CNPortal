using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPortalAPI.Models
{
    public class Vendor
    {
        [Key]
        public int VendorID { get; set; }

        [Required]
        public int EmployeeID { get; set; }

        [Required]
        [StringLength(50)]
        public string VendorName { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal RatePerHour { get; set; }

        // Navigation properties
        [ForeignKey("EmployeeID")]
        public virtual Employee Employee { get; set; } = null!;

        public virtual ICollection<MasterTimeSheet> MasterTimeSheets { get; set; } = new List<MasterTimeSheet>();
    }
}