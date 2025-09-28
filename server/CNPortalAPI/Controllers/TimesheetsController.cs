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
    public class TimesheetsController : ControllerBase
    {
        private readonly CNPortalDbContext _context;

        public TimesheetsController(CNPortalDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<TimesheetListResponse>> GetTimesheets(
            [FromQuery] int? employeeId = null,
            [FromQuery] string? status = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                var query = _context.MasterTimeSheets
                    .Include(m => m.Employee)
                    .AsQueryable();

                // Apply role-based filtering
                if (userRole == "Emp" || userRole == "Employee")
                {
                    query = query.Where(m => m.EmployeeID == currentUserId);
                }
                else if (employeeId.HasValue)
                {
                    query = query.Where(m => m.EmployeeID == employeeId.Value);
                }

                // Apply date filters
                if (fromDate.HasValue)
                    query = query.Where(m => m.FromDate >= fromDate.Value);

                if (toDate.HasValue)
                    query = query.Where(m => m.ToDate <= toDate.Value);

                var total = await query.CountAsync();

                var timesheets = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(m => new TimesheetSummary
                    {
                        IndexId = m.IndexID,
                        EmployeeId = m.EmployeeID,
                        FromDate = m.FromDate,
                        ToDate = m.ToDate,
                        TotalHoursWorked = m.TotalHoursWorked,
                        ApprovalL1 = m.ApprovalL1,
                        ApprovalL2 = m.ApprovalL2,
                        Status = GetTimesheetStatus(m.ApprovalL1, m.ApprovalL2)
                    })
                    .ToListAsync();

                return Ok(new TimesheetListResponse
                {
                    Items = timesheets,
                    Page = page,
                    PageSize = pageSize,
                    Total = total
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new TimesheetListResponse());
            }
        }

        [HttpGet("{indexId}")]
        public async Task<ActionResult<TimesheetDetailResponse>> GetTimesheet(int indexId)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                var timesheet = await _context.MasterTimeSheets
                    .Include(m => m.Employee)
                    .Include(m => m.EveryDayTimesheets)
                    .FirstOrDefaultAsync(m => m.IndexID == indexId);

                if (timesheet == null)
                {
                    return NotFound();
                }

                // Check access permissions
                if (userRole == "Emp" && timesheet.EmployeeID != currentUserId)
                {
                    return Forbid();
                }

                var response = new TimesheetDetailResponse
                {
                    Header = new TimesheetHeader
                    {
                        IndexId = timesheet.IndexID,
                        EmployeeId = timesheet.EmployeeID,
                        FromDate = timesheet.FromDate,
                        ToDate = timesheet.ToDate,
                        TotalHoursWorked = timesheet.TotalHoursWorked,
                        ApprovalL1 = timesheet.ApprovalL1,
                        ApprovalL2 = timesheet.ApprovalL2,
                        Comments = timesheet.Comments,
                        RatePerHour = timesheet.RatePerHour
                    },
                    Entries = timesheet.EveryDayTimesheets.Select(e => new TimesheetEntry
                    {
                        TimesheetId = e.TimesheetID,
                        Date = e.Date,
                        HoursWorked = e.HoursWorked
                    }).ToList(),
                    Attachments = new List<AttachmentInfo>
                    {
                        // For now, just add the filename from MasterTimeSheet
                        new AttachmentInfo
                        {
                            FileName = timesheet.FileName,
                            Size = 0,
                            ContentType = "application/pdf"
                        }
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500);
            }
        }

        [HttpPost]
        public async Task<ActionResult<CreateEmployeeResponse>> CreateTimesheet(CreateTimesheetRequest request)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                // Check permissions
                if (userRole == "Emp" && request.EmployeeId != currentUserId)
                {
                    return Forbid();
                }

                // Get employee and vendor info
                var employee = await _context.Employees
                    .Include(e => e.Vendor)
                    .FirstOrDefaultAsync(e => e.EmployeeID == request.EmployeeId);

                if (employee == null)
                {
                    return BadRequest(new CreateEmployeeResponse
                    {
                        Message = "Employee not found"
                    });
                }

                // Create master timesheet
                var fileName = request.Attachment != null ? Guid.NewGuid().ToString() : string.Empty;
                var masterTimesheet = new MasterTimeSheet
                {
                    FileName = fileName,
                    StorageAccount = "Azure", // Placeholder
                    EmployeeID = request.EmployeeId,
                    FromDate = request.PeriodStart,
                    ToDate = request.PeriodEnd,
                    TotalHoursWorked = request.Entries.Sum(e => e.HoursWorked),
                    CreationDate = DateTime.UtcNow,
                    ModifiedDate = DateTime.UtcNow,
                    VendorID = employee.Vendor?.VendorID ?? 0,
                    RatePerHour = employee.Vendor?.RatePerHour ?? 0,
                    ApprovalL1 = false,
                    ApprovalL2 = false
                };

                _context.MasterTimeSheets.Add(masterTimesheet);
                await _context.SaveChangesAsync();

                // Create daily entries
                foreach (var entry in request.Entries)
                {
                    var dailyEntry = new EveryDayTimesheet
                    {
                        EmployeeID = request.EmployeeId,
                        Date = entry.Date,
                        HoursWorked = entry.HoursWorked,
                        IndexID = masterTimesheet.IndexID
                    };

                    _context.EveryDayTimesheets.Add(dailyEntry);
                }

                await _context.SaveChangesAsync();

                return Ok(new CreateEmployeeResponse
                {
                    EmployeeId = masterTimesheet.IndexID,
                    Message = "Timesheet created successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new CreateEmployeeResponse
                {
                    Message = "An error occurred while creating timesheet"
                });
            }
        }

        [HttpPut("{indexId}")]
        public async Task<ActionResult<ApiResponse>> UpdateTimesheet(int indexId, UpdateTimesheetRequest request)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                var timesheet = await _context.MasterTimeSheets
                    .Include(m => m.EveryDayTimesheets)
                    .FirstOrDefaultAsync(m => m.IndexID == indexId);

                if (timesheet == null)
                {
                    return NotFound(new ApiResponse
                    {
                        Message = "Timesheet not found",
                        Success = false
                    });
                }

                // Check permissions
                if (userRole == "Emp" && timesheet.EmployeeID != currentUserId)
                {
                    return Forbid();
                }

                // Check if timesheet is approved
                if (timesheet.ApprovalL1 && timesheet.ApprovalL2)
                {
                    return BadRequest(new ApiResponse
                    {
                        Message = "Cannot modify approved timesheet",
                        Success = false
                    });
                }

                // Update comments
                if (!string.IsNullOrEmpty(request.Comments))
                {
                    timesheet.Comments = request.Comments;
                }

                // Update entries
                foreach (var entryRequest in request.Entries)
                {
                    var existingEntry = timesheet.EveryDayTimesheets
                        .FirstOrDefault(e => e.Date.Date == entryRequest.Date.Date);

                    if (existingEntry != null)
                    {
                        existingEntry.HoursWorked = entryRequest.HoursWorked;
                    }
                    else
                    {
                        var newEntry = new EveryDayTimesheet
                        {
                            EmployeeID = timesheet.EmployeeID,
                            Date = entryRequest.Date,
                            HoursWorked = entryRequest.HoursWorked,
                            IndexID = indexId
                        };
                        _context.EveryDayTimesheets.Add(newEntry);
                    }
                }

                // Recalculate total hours
                timesheet.TotalHoursWorked = timesheet.EveryDayTimesheets.Sum(e => e.HoursWorked);
                timesheet.ModifiedDate = DateTime.UtcNow;

                // Reset approvals if resubmitting
                if (request.Resubmit)
                {
                    timesheet.ApprovalL1 = false;
                    timesheet.ApprovalL2 = false;
                }

                await _context.SaveChangesAsync();

                return Ok(new ApiResponse { Message = "Timesheet updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse
                {
                    Message = "An error occurred while updating timesheet",
                    Success = false
                });
            }
        }

        [HttpPut("{indexId}/entries")]
        public async Task<ActionResult<ApiResponse>> UpdateTimesheetEntries(int indexId, BulkUpdateEntriesRequest request)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                var timesheet = await _context.MasterTimeSheets
                    .Include(m => m.EveryDayTimesheets)
                    .FirstOrDefaultAsync(m => m.IndexID == indexId);

                if (timesheet == null)
                {
                    return NotFound(new ApiResponse
                    {
                        Message = "Timesheet not found",
                        Success = false
                    });
                }

                // Check permissions
                if (userRole == "Emp" && timesheet.EmployeeID != currentUserId)
                {
                    return Forbid();
                }

                // Update all entries
                foreach (var entryRequest in request.Entries)
                {
                    var existingEntry = timesheet.EveryDayTimesheets
                        .FirstOrDefault(e => e.Date.Date == entryRequest.Date.Date);

                    if (existingEntry != null)
                    {
                        existingEntry.HoursWorked = entryRequest.HoursWorked;
                    }
                    else
                    {
                        var newEntry = new EveryDayTimesheet
                        {
                            EmployeeID = timesheet.EmployeeID,
                            Date = entryRequest.Date,
                            HoursWorked = entryRequest.HoursWorked,
                            IndexID = indexId
                        };
                        _context.EveryDayTimesheets.Add(newEntry);
                    }
                }

                // Recalculate total hours
                var totalHours = request.Entries.Sum(e => e.HoursWorked);
                timesheet.TotalHoursWorked = totalHours;
                timesheet.ModifiedDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new ApiResponse
                {
                    Message = "Entries saved successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse
                {
                    Message = "An error occurred while updating entries",
                    Success = false
                });
            }
        }

        private static string GetTimesheetStatus(bool approvalL1, bool approvalL2)
        {
            if (approvalL1 && approvalL2)
                return "Approved";
            else if (approvalL1)
                return "Level 1 Approved";
            else
                return "Pending";
        }
    }
}