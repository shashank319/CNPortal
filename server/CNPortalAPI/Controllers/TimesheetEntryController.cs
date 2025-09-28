using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using CNPortalAPI.Models;
using CNPortalAPI.DTOs;
using System.Security.Claims;

namespace CNPortalAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TimesheetEntryController : ControllerBase
    {
        private readonly CNPortalDbContext _context;

        public TimesheetEntryController(CNPortalDbContext context)
        {
            _context = context;
        }

        [HttpGet("period-info")]
        public ActionResult<TimesheetPeriodInfoDTO> GetPeriodInfo(
            [FromQuery] TimesheetPeriodType periodType,
            [FromQuery] int year,
            [FromQuery] int month,
            [FromQuery] int? weekNumber = null)
        {
            try
            {
                var periodInfo = CalculatePeriodInfo(periodType, year, month, weekNumber);
                return Ok(periodInfo);
            }
            catch (Exception ex)
            {
                return BadRequest($"Invalid period parameters: {ex.Message}");
            }
        }

        [HttpGet("draft")]
        public async Task<ActionResult<TimesheetEntryResponseDTO?>> GetDraftTimesheet(
            [FromQuery] TimesheetPeriodType periodType,
            [FromQuery] int year,
            [FromQuery] int month,
            [FromQuery] int? weekNumber = null)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                var periodInfo = CalculatePeriodInfo(periodType, year, month, weekNumber);

                var existingTimesheet = await _context.MasterTimeSheets
                    .Include(m => m.Employee)
                    .Include(m => m.EveryDayTimesheets)
                    .FirstOrDefaultAsync(m =>
                        m.EmployeeID == currentUserId &&
                        m.PeriodType == periodType &&
                        m.Year == year &&
                        m.Month == month &&
                        (weekNumber == null || m.WeekNumber == weekNumber) &&
                        m.Status == TimesheetStatus.Draft);

                if (existingTimesheet == null)
                {
                    return Ok((TimesheetEntryResponseDTO?)null);
                }

                var response = MapToResponseDTO(existingTimesheet, periodInfo);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving draft timesheet: {ex.Message}");
            }
        }

        [HttpPost("auto-fill")]
        public ActionResult<List<DailyHoursDTO>> AutoFillHours([FromBody] AutoFillRequestDTO request)
        {
            try
            {
                var periodInfo = CalculatePeriodInfo(request.PeriodType, request.Year, request.Month, request.WeekNumber);
                var dailyHours = new List<DailyHoursDTO>();

                for (var date = periodInfo.StartDate; date <= periodInfo.EndDate; date = date.AddDays(1))
                {
                    var isWeekend = date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday;
                    var hours = (request.WeekdaysOnly && isWeekend) ? 0 : request.HoursPerDay;

                    dailyHours.Add(new DailyHoursDTO
                    {
                        Date = date,
                        Hours = hours,
                        IsWeekend = isWeekend,
                        IsHoliday = false // Could be enhanced to check holiday calendar
                    });
                }

                return Ok(dailyHours);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error generating auto-fill hours: {ex.Message}");
            }
        }

        [HttpPost("save-draft")]
        public async Task<ActionResult<TimesheetEntryResponseDTO>> SaveDraft([FromBody] TimesheetEntryRequestDTO request)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                // Ensure the employee can only create/edit their own timesheet
                if (request.EmployeeID != currentUserId)
                {
                    return Forbid("You can only manage your own timesheets");
                }

                var periodInfo = CalculatePeriodInfo(request.PeriodType, request.Year, request.Month, request.WeekNumber);

                // Check if draft already exists
                var existingTimesheet = await _context.MasterTimeSheets
                    .Include(m => m.EveryDayTimesheets)
                    .FirstOrDefaultAsync(m =>
                        m.EmployeeID == currentUserId &&
                        m.PeriodType == request.PeriodType &&
                        m.Year == request.Year &&
                        m.Month == request.Month &&
                        (request.WeekNumber == null || m.WeekNumber == request.WeekNumber) &&
                        m.Status == TimesheetStatus.Draft);

                if (existingTimesheet != null)
                {
                    // Update existing draft
                    await UpdateTimesheetEntries(existingTimesheet, request.DailyHours);
                    existingTimesheet.TotalHoursWorked = request.DailyHours.Sum(d => d.Hours);
                    existingTimesheet.ModifiedDate = DateTime.UtcNow;
                }
                else
                {
                    // Create new draft
                    existingTimesheet = await CreateNewTimesheet(request, currentUserId, periodInfo, TimesheetStatus.Draft);
                }

                await _context.SaveChangesAsync();

                var response = MapToResponseDTO(existingTimesheet, periodInfo);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error saving draft: {ex.Message}");
            }
        }

        [HttpPost("submit")]
        public async Task<ActionResult<TimesheetEntryResponseDTO>> SubmitTimesheet([FromBody] TimesheetEntryRequestDTO request)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                if (request.EmployeeID != currentUserId)
                {
                    return Forbid("You can only submit your own timesheets");
                }

                // Validate hours
                var validationResult = ValidateTimesheetEntries(request.DailyHours);
                if (!validationResult.IsValid)
                {
                    return BadRequest(validationResult.ErrorMessage);
                }

                var periodInfo = CalculatePeriodInfo(request.PeriodType, request.Year, request.Month, request.WeekNumber);

                // Check if already submitted for this period
                var existingSubmittedTimesheet = await _context.MasterTimeSheets
                    .FirstOrDefaultAsync(m =>
                        m.EmployeeID == currentUserId &&
                        m.PeriodType == request.PeriodType &&
                        m.Year == request.Year &&
                        m.Month == request.Month &&
                        (request.WeekNumber == null || m.WeekNumber == request.WeekNumber) &&
                        m.Status != TimesheetStatus.Draft);

                if (existingSubmittedTimesheet != null)
                {
                    return BadRequest("Timesheet for this period has already been submitted");
                }

                // Get or create timesheet
                var timesheet = await _context.MasterTimeSheets
                    .Include(m => m.EveryDayTimesheets)
                    .FirstOrDefaultAsync(m =>
                        m.EmployeeID == currentUserId &&
                        m.PeriodType == request.PeriodType &&
                        m.Year == request.Year &&
                        m.Month == request.Month &&
                        (request.WeekNumber == null || m.WeekNumber == request.WeekNumber) &&
                        m.Status == TimesheetStatus.Draft);

                if (timesheet != null)
                {
                    // Update existing draft and submit
                    await UpdateTimesheetEntries(timesheet, request.DailyHours);
                    timesheet.Status = TimesheetStatus.Submitted;
                    timesheet.SubmittedDate = DateTime.UtcNow;
                    timesheet.TotalHoursWorked = request.DailyHours.Sum(d => d.Hours);
                    timesheet.ModifiedDate = DateTime.UtcNow;
                }
                else
                {
                    // Create new and submit
                    timesheet = await CreateNewTimesheet(request, currentUserId, periodInfo, TimesheetStatus.Submitted);
                    timesheet.SubmittedDate = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();

                var response = MapToResponseDTO(timesheet, periodInfo);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error submitting timesheet: {ex.Message}");
            }
        }

        [HttpGet("submitted")]
        public async Task<ActionResult<List<TimesheetEntryResponseDTO>>> GetSubmittedTimesheets(
            [FromQuery] int? year = null,
            [FromQuery] int? month = null)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                var query = _context.MasterTimeSheets
                    .Include(m => m.Employee)
                    .Include(m => m.EveryDayTimesheets)
                    .Where(m => m.EmployeeID == currentUserId && m.Status != TimesheetStatus.Draft);

                if (year.HasValue)
                    query = query.Where(m => m.Year == year.Value);

                if (month.HasValue)
                    query = query.Where(m => m.Month == month.Value);

                var timesheets = await query
                    .OrderByDescending(m => m.Year)
                    .ThenByDescending(m => m.Month)
                    .ThenByDescending(m => m.WeekNumber)
                    .ToListAsync();

                var responses = timesheets.Select(t =>
                {
                    var periodInfo = CalculatePeriodInfo(t.PeriodType, t.Year, t.Month, t.WeekNumber);
                    return MapToResponseDTO(t, periodInfo);
                }).ToList();

                return Ok(responses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving submitted timesheets: {ex.Message}");
            }
        }

        [HttpDelete("draft")]
        public async Task<ActionResult> DeleteDraft(
            [FromQuery] TimesheetPeriodType periodType,
            [FromQuery] int year,
            [FromQuery] int month,
            [FromQuery] int? weekNumber = null)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                var timesheet = await _context.MasterTimeSheets
                    .Include(m => m.EveryDayTimesheets)
                    .FirstOrDefaultAsync(m =>
                        m.EmployeeID == currentUserId &&
                        m.PeriodType == periodType &&
                        m.Year == year &&
                        m.Month == month &&
                        (weekNumber == null || m.WeekNumber == weekNumber) &&
                        m.Status == TimesheetStatus.Draft);

                if (timesheet == null)
                {
                    return NotFound("Draft timesheet not found");
                }

                _context.EveryDayTimesheets.RemoveRange(timesheet.EveryDayTimesheets);
                _context.MasterTimeSheets.Remove(timesheet);
                await _context.SaveChangesAsync();

                return Ok("Draft timesheet deleted successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting draft: {ex.Message}");
            }
        }

        // Helper Methods
        private static TimesheetPeriodInfoDTO CalculatePeriodInfo(TimesheetPeriodType periodType, int year, int month, int? weekNumber)
        {
            DateTime startDate, endDate;
            var workingDays = new List<DateTime>();
            var weekends = new List<DateTime>();

            switch (periodType)
            {
                case TimesheetPeriodType.Weekly:
                    if (!weekNumber.HasValue)
                        throw new ArgumentException("Week number is required for weekly timesheets");

                    var firstDayOfMonth = new DateTime(year, month, 1);
                    var firstMonday = firstDayOfMonth.AddDays(-(int)firstDayOfMonth.DayOfWeek + (int)DayOfWeek.Monday);
                    if (firstMonday < firstDayOfMonth)
                        firstMonday = firstMonday.AddDays(7);

                    startDate = firstMonday.AddDays((weekNumber.Value - 1) * 7);
                    endDate = startDate.AddDays(6);
                    break;

                case TimesheetPeriodType.BiWeekly:
                    if (!weekNumber.HasValue)
                        throw new ArgumentException("Week number is required for bi-weekly timesheets");

                    var firstDayOfMonthBi = new DateTime(year, month, 1);
                    var firstMondayBi = firstDayOfMonthBi.AddDays(-(int)firstDayOfMonthBi.DayOfWeek + (int)DayOfWeek.Monday);
                    if (firstMondayBi < firstDayOfMonthBi)
                        firstMondayBi = firstMondayBi.AddDays(7);

                    startDate = firstMondayBi.AddDays((weekNumber.Value - 1) * 14);
                    endDate = startDate.AddDays(13);
                    break;

                case TimesheetPeriodType.Monthly:
                    startDate = new DateTime(year, month, 1);
                    endDate = startDate.AddMonths(1).AddDays(-1);
                    break;

                default:
                    throw new ArgumentException("Invalid period type");
            }

            // Populate working days and weekends
            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                if (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday)
                {
                    weekends.Add(date);
                }
                else
                {
                    workingDays.Add(date);
                }
            }

            return new TimesheetPeriodInfoDTO
            {
                PeriodType = periodType,
                Year = year,
                Month = month,
                WeekNumber = weekNumber,
                StartDate = startDate,
                EndDate = endDate,
                WorkingDays = workingDays,
                Weekends = weekends
            };
        }

        private async Task<MasterTimeSheet> CreateNewTimesheet(TimesheetEntryRequestDTO request, int employeeId, TimesheetPeriodInfoDTO periodInfo, TimesheetStatus status)
        {
            var employee = await _context.Employees.Include(e => e.Vendor).FirstOrDefaultAsync(e => e.EmployeeID == employeeId);

            var timesheet = new MasterTimeSheet
            {
                EmployeeID = employeeId,
                PeriodType = request.PeriodType,
                Year = request.Year,
                Month = request.Month,
                WeekNumber = request.WeekNumber,
                FromDate = periodInfo.StartDate,
                ToDate = periodInfo.EndDate,
                TotalHoursWorked = request.DailyHours.Sum(d => d.Hours),
                Status = status,
                CreationDate = DateTime.UtcNow,
                ModifiedDate = DateTime.UtcNow,
                VendorID = employee?.VendorID ?? 0,
                RatePerHour = employee?.Vendor?.RatePerHour ?? 0,
                FileName = string.Empty,
                StorageAccount = string.Empty
            };

            _context.MasterTimeSheets.Add(timesheet);
            await _context.SaveChangesAsync();

            // Add daily entries
            foreach (var dailyHour in request.DailyHours)
            {
                var entry = new EveryDayTimesheet
                {
                    EmployeeID = employeeId,
                    Date = dailyHour.Date,
                    HoursWorked = dailyHour.Hours,
                    IndexID = timesheet.IndexID
                };
                _context.EveryDayTimesheets.Add(entry);
            }

            return timesheet;
        }

        private async Task UpdateTimesheetEntries(MasterTimeSheet timesheet, List<DailyHoursDTO> dailyHours)
        {
            // Remove existing entries
            _context.EveryDayTimesheets.RemoveRange(timesheet.EveryDayTimesheets);

            // Add new entries
            foreach (var dailyHour in dailyHours)
            {
                var entry = new EveryDayTimesheet
                {
                    EmployeeID = timesheet.EmployeeID,
                    Date = dailyHour.Date,
                    HoursWorked = dailyHour.Hours,
                    IndexID = timesheet.IndexID
                };
                _context.EveryDayTimesheets.Add(entry);
            }
        }

        private static TimesheetEntryResponseDTO MapToResponseDTO(MasterTimeSheet timesheet, TimesheetPeriodInfoDTO periodInfo)
        {
            var employee = timesheet.Employee;
            var employeeName = employee != null ? $"{employee.FirstName} {employee.LastName}" : "Unknown";

            return new TimesheetEntryResponseDTO
            {
                TimesheetID = timesheet.IndexID,
                EmployeeID = timesheet.EmployeeID,
                EmployeeName = employeeName,
                PeriodType = timesheet.PeriodType,
                Year = timesheet.Year,
                Month = timesheet.Month,
                WeekNumber = timesheet.WeekNumber,
                StartDate = timesheet.FromDate,
                EndDate = timesheet.ToDate,
                TotalHours = timesheet.TotalHoursWorked,
                Status = timesheet.Status,
                CreatedDate = timesheet.CreationDate,
                SubmittedDate = timesheet.SubmittedDate,
                Comments = timesheet.Comments,
                DailyHours = timesheet.EveryDayTimesheets.Select(e => new DailyHoursDTO
                {
                    Date = e.Date,
                    Hours = e.HoursWorked,
                    IsWeekend = e.Date.DayOfWeek == DayOfWeek.Saturday || e.Date.DayOfWeek == DayOfWeek.Sunday,
                    IsHoliday = false // Could be enhanced to check holiday calendar
                }).ToList()
            };
        }

        private static (bool IsValid, string ErrorMessage) ValidateTimesheetEntries(List<DailyHoursDTO> dailyHours)
        {
            foreach (var entry in dailyHours)
            {
                if (entry.Hours < 0 || entry.Hours > 24)
                {
                    return (false, $"Invalid hours for {entry.Date:MM/dd/yyyy}: {entry.Hours}. Hours must be between 0 and 24.");
                }
            }

            var totalHours = dailyHours.Sum(d => d.Hours);
            if (totalHours > 168) // 24 hours * 7 days
            {
                return (false, $"Total hours ({totalHours}) cannot exceed 168 hours per week.");
            }

            return (true, string.Empty);
        }
    }
}