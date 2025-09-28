using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNPortalAPI.Models
{
    public class Candidate
    {
        [Key]
        public int CandidateID { get; set; }

        [Required]
        [StringLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string ClientName { get; set; } = string.Empty;

        [Required]
        public int EmployerID { get; set; }

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "active";

        [StringLength(1000)]
        public string? Skills { get; set; }

        public int? Experience { get; set; }

        [StringLength(255)]
        public string? Resume { get; set; }

        [StringLength(1000)]
        public string? Notes { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal? HourlyRate { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("EmployerID")]
        public virtual Employee? Employer { get; set; }
    }
}