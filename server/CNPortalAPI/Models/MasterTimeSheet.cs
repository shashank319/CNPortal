using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPortalAPI.Models
{
    public enum TimesheetPeriodType
    {
        Weekly = 1,
        BiWeekly = 2,
        Monthly = 3
    }

    public enum TimesheetStatus
    {
        Draft = 1,
        Submitted = 2,
        ApprovedL1 = 3,
        ApprovedL2 = 4,
        Rejected = 5
    }

    public class MasterTimeSheet
    {
        [Key]
        public int IndexID { get; set; }

        [StringLength(50)]
        public string? FileName { get; set; }

        [StringLength(50)]
        public string? StorageAccount { get; set; }

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

        // New fields for enhanced timesheet functionality
        [Required]
        public TimesheetPeriodType PeriodType { get; set; } = TimesheetPeriodType.Weekly;

        [Required]
        public int Year { get; set; }

        [Required]
        public int Month { get; set; }

        public int? WeekNumber { get; set; } // For weekly/bi-weekly periods

        [Required]
        public TimesheetStatus Status { get; set; } = TimesheetStatus.Draft;

        public DateTime? SubmittedDate { get; set; }

        public DateTime? ApprovedL1Date { get; set; }

        public DateTime? ApprovedL2Date { get; set; }

        public DateTime? RejectedDate { get; set; }

        [StringLength(500)]
        public string? RejectionReason { get; set; }

        // Navigation properties
        [ForeignKey("EmployeeID")]
        public virtual Employee Employee { get; set; } = null!;

        [ForeignKey("VendorID")]
        public virtual Vendor Vendor { get; set; } = null!;

        public virtual ICollection<EveryDayTimesheet> EveryDayTimesheets { get; set; } = new List<EveryDayTimesheet>();
    }
}