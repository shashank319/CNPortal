using System.ComponentModel.DataAnnotations;
using CNPortalAPI.Models;

namespace CNPortalAPI.DTOs
{

    public class TimesheetEntryRequestDTO
    {
        [Required]
        public int EmployeeID { get; set; }

        [Required]
        public TimesheetPeriodType PeriodType { get; set; }

        [Required]
        public int Year { get; set; }

        [Required]
        public int Month { get; set; }

        public int? WeekNumber { get; set; } // For weekly/bi-weekly

        [Required]
        public List<DailyHoursDTO> DailyHours { get; set; } = new List<DailyHoursDTO>();

        public bool IsDraft { get; set; } = true;
    }

    public class DailyHoursDTO
    {
        [Required]
        public DateTime Date { get; set; }

        [Required]
        [Range(0, 24, ErrorMessage = "Hours must be between 0 and 24")]
        public decimal Hours { get; set; }

        public bool IsWeekend { get; set; }

        public bool IsHoliday { get; set; }
    }

    public class TimesheetEntryResponseDTO
    {
        public int TimesheetID { get; set; }
        public int EmployeeID { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public TimesheetPeriodType PeriodType { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
        public int? WeekNumber { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalHours { get; set; }
        public TimesheetStatus Status { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? SubmittedDate { get; set; }
        public List<DailyHoursDTO> DailyHours { get; set; } = new List<DailyHoursDTO>();
        public string? Comments { get; set; }
    }

    public class TimesheetPeriodInfoDTO
    {
        public TimesheetPeriodType PeriodType { get; set; }
        public int Year { get; set; }
        public int Month { get; set; }
        public int? WeekNumber { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<DateTime> WorkingDays { get; set; } = new List<DateTime>();
        public List<DateTime> Weekends { get; set; } = new List<DateTime>();
    }

    public class AutoFillRequestDTO
    {
        [Required]
        public TimesheetPeriodType PeriodType { get; set; }

        [Required]
        public int Year { get; set; }

        [Required]
        public int Month { get; set; }

        public int? WeekNumber { get; set; }

        [Required]
        [Range(0, 24, ErrorMessage = "Hours per day must be between 0 and 24")]
        public decimal HoursPerDay { get; set; } = 8;

        public bool WeekdaysOnly { get; set; } = true;
    }
}