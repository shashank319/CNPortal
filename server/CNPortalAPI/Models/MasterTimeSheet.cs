using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPortalAPI.Models
{
    public class MasterTimeSheet
    {
        [Key]
        public int IndexID { get; set; }

        [Required]
        [StringLength(50)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string StorageAccount { get; set; } = string.Empty;

        [Required]
        public int EmployeeID { get; set; }

        [Required]
        public DateTime FromDate { get; set; }

        [Required]
        public DateTime ToDate { get; set; }

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal TotalHoursWorked { get; set; }

        [Required]
        public DateTime CreationDate { get; set; }

        [Required]
        public int VendorID { get; set; }

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal RatePerHour { get; set; }

        [Required]
        public DateTime ModifiedDate { get; set; }

        public bool ApprovalL1 { get; set; }

        public bool ApprovalL2 { get; set; }

        [StringLength(500)]
        public string? Comments { get; set; }

        // Navigation properties
        [ForeignKey("EmployeeID")]
        public virtual Employee Employee { get; set; } = null!;

        [ForeignKey("VendorID")]
        public virtual Vendor Vendor { get; set; } = null!;

        public virtual ICollection<EveryDayTimesheet> EveryDayTimesheets { get; set; } = new List<EveryDayTimesheet>();
    }
}