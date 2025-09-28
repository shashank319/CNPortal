using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPortalAPI.Models
{
    public class EveryDayTimesheet
    {
        [Key]
        public int TimesheetID { get; set; }

        [Required]
        public int EmployeeID { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal HoursWorked { get; set; }

        // Navigation property
        [ForeignKey("EmployeeID")]
        public virtual Employee Employee { get; set; } = null!;

        // Optional: Link to MasterTimeSheet for better data integrity
        public int? IndexID { get; set; }

        [ForeignKey("IndexID")]
        public virtual MasterTimeSheet? MasterTimeSheet { get; set; }
    }
}