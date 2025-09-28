using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using CNPortalAPI.Models;
using CNPortalAPI.DTOs;

namespace CNPortalAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly CNPortalDbContext _context;

        public AdminController(CNPortalDbContext context)
        {
            _context = context;
        }

        [HttpPost("timesheets/{indexId}/reopen")]
        public async Task<ActionResult<ApiResponse>> ReopenTimesheet(int indexId)
        {
            try
            {
                var timesheet = await _context.MasterTimeSheets
                    .FirstOrDefaultAsync(m => m.IndexID == indexId);

                if (timesheet == null)
                {
                    return NotFound(new ApiResponse
                    {
                        Message = "Timesheet not found",
                        Success = false
                    });
                }

                // Reset approval flags to allow editing
                timesheet.ApprovalL1 = false;
                timesheet.ApprovalL2 = false;
                timesheet.ModifiedDate = DateTime.UtcNow;

                // Add admin comment
                timesheet.Comments = string.IsNullOrEmpty(timesheet.Comments)
                    ? "Timesheet reopened by admin for edits"
                    : $"{timesheet.Comments}\n\nTimesheet reopened by admin for edits - {DateTime.UtcNow:yyyy-MM-dd HH:mm}";

                await _context.SaveChangesAsync();

                return Ok(new ApiResponse
                {
                    Message = "Timesheet reopened for edits"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse
                {
                    Message = "An error occurred while reopening timesheet",
                    Success = false
                });
            }
        }

        [HttpPut("employees/{employeeId}/role")]
        public async Task<ActionResult<ApiResponse>> UpdateEmployeeRole(int employeeId, UpdateRoleRequest request)
        {
            try
            {
                var employee = await _context.Employees
                    .Include(e => e.Identity)
                    .FirstOrDefaultAsync(e => e.EmployeeID == employeeId);

                if (employee == null)
                {
                    return NotFound(new ApiResponse
                    {
                        Message = "Employee not found",
                        Success = false
                    });
                }

                // Find the new identity role
                var newIdentity = await _context.Identities
                    .FirstOrDefaultAsync(i => i.Role == request.Role);

                if (newIdentity == null)
                {
                    return BadRequest(new ApiResponse
                    {
                        Message = "Invalid role specified",
                        Success = false
                    });
                }

                // Update employee's identity
                employee.IdentityID = newIdentity.IdentityID;
                await _context.SaveChangesAsync();

                return Ok(new ApiResponse
                {
                    Message = $"Employee role updated to {request.Role}"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse
                {
                    Message = "An error occurred while updating employee role",
                    Success = false
                });
            }
        }

        [HttpGet("dashboard")]
        public async Task<ActionResult<object>> GetAdminDashboard()
        {
            try
            {
                var totalEmployees = await _context.Employees.CountAsync();
                var activeEmployees = await _context.Employees
                    .Where(e => e.Status == "Active")
                    .CountAsync();

                var pendingTimesheets = await _context.MasterTimeSheets
                    .Where(m => !m.ApprovalL1 || !m.ApprovalL2)
                    .CountAsync();

                var approvedTimesheets = await _context.MasterTimeSheets
                    .Where(m => m.ApprovalL1 && m.ApprovalL2)
                    .CountAsync();

                var recentTimesheets = await _context.MasterTimeSheets
                    .Include(m => m.Employee)
                    .OrderByDescending(m => m.CreationDate)
                    .Take(10)
                    .Select(m => new
                    {
                        m.IndexID,
                        EmployeeName = $"{m.Employee.FirstName} {m.Employee.LastName}",
                        m.FromDate,
                        m.ToDate,
                        m.TotalHoursWorked,
                        Status = m.ApprovalL1 && m.ApprovalL2 ? "Approved" :
                                m.ApprovalL1 ? "Level 1 Approved" : "Pending",
                        m.CreationDate
                    })
                    .ToListAsync();

                var roleDistribution = await _context.Employees
                    .Include(e => e.Identity)
                    .GroupBy(e => e.Identity.Role)
                    .Select(g => new
                    {
                        Role = g.Key,
                        Count = g.Count()
                    })
                    .ToListAsync();

                return Ok(new
                {
                    Summary = new
                    {
                        TotalEmployees = totalEmployees,
                        ActiveEmployees = activeEmployees,
                        PendingTimesheets = pendingTimesheets,
                        ApprovedTimesheets = approvedTimesheets
                    },
                    RecentTimesheets = recentTimesheets,
                    RoleDistribution = roleDistribution
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while fetching dashboard data" });
            }
        }

        [HttpGet("timesheets/pending")]
        public async Task<ActionResult<object>> GetPendingTimesheets(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var query = _context.MasterTimeSheets
                    .Include(m => m.Employee)
                    .Where(m => !m.ApprovalL1 || !m.ApprovalL2);

                var total = await query.CountAsync();

                var timesheets = await query
                    .OrderBy(m => m.CreationDate)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(m => new
                    {
                        m.IndexID,
                        EmployeeName = $"{m.Employee.FirstName} {m.Employee.LastName}",
                        m.Employee.Email,
                        m.FromDate,
                        m.ToDate,
                        m.TotalHoursWorked,
                        m.ApprovalL1,
                        m.ApprovalL2,
                        Status = m.ApprovalL1 && m.ApprovalL2 ? "Approved" :
                                m.ApprovalL1 ? "Awaiting Level 2" : "Awaiting Level 1",
                        m.CreationDate,
                        DaysWaiting = (DateTime.UtcNow - m.CreationDate).Days
                    })
                    .ToListAsync();

                return Ok(new
                {
                    Items = timesheets,
                    Page = page,
                    PageSize = pageSize,
                    Total = total
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while fetching pending timesheets" });
            }
        }

        [HttpGet("reports/utilization")]
        public async Task<ActionResult<object>> GetUtilizationReport(
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            try
            {
                fromDate ??= DateTime.UtcNow.AddDays(-30);
                toDate ??= DateTime.UtcNow;

                var utilizationData = await _context.MasterTimeSheets
                    .Include(m => m.Employee)
                    .Where(m => m.FromDate >= fromDate && m.ToDate <= toDate && m.ApprovalL1 && m.ApprovalL2)
                    .GroupBy(m => new { m.Employee.FirstName, m.Employee.LastName, m.EmployeeID })
                    .Select(g => new
                    {
                        EmployeeId = g.Key.EmployeeID,
                        EmployeeName = $"{g.Key.FirstName} {g.Key.LastName}",
                        TotalHours = g.Sum(m => m.TotalHoursWorked),
                        TimesheetCount = g.Count(),
                        AverageHoursPerWeek = g.Average(m => m.TotalHoursWorked)
                    })
                    .OrderByDescending(x => x.TotalHours)
                    .ToListAsync();

                var totalHours = utilizationData.Sum(x => x.TotalHours);
                var averageHours = utilizationData.Any() ? utilizationData.Average(x => x.TotalHours) : 0;

                return Ok(new
                {
                    Summary = new
                    {
                        TotalHours = totalHours,
                        AverageHours = averageHours,
                        EmployeeCount = utilizationData.Count
                    },
                    EmployeeUtilization = utilizationData
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while generating utilization report" });
            }
        }

        [HttpPost("employees/{employeeId}/reset-password")]
        public async Task<ActionResult<ApiResponse>> ResetEmployeePassword(int employeeId)
        {
            try
            {
                var employee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.EmployeeID == employeeId);

                if (employee == null)
                {
                    return NotFound(new ApiResponse
                    {
                        Message = "Employee not found",
                        Success = false
                    });
                }

                // Generate temporary password
                var tempPassword = "TempPass@123";
                employee.PasswordHash = BCrypt.Net.BCrypt.HashPassword(tempPassword);
                employee.FirstTimeFlag = true;

                await _context.SaveChangesAsync();

                return Ok(new ApiResponse
                {
                    Message = $"Password reset. Temporary password: {tempPassword}"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse
                {
                    Message = "An error occurred while resetting password",
                    Success = false
                });
            }
        }

        [HttpPut("employees/{employeeId}/status")]
        public async Task<ActionResult<ApiResponse>> UpdateEmployeeStatus(int employeeId, [FromBody] UpdateEmployeeRequest request)
        {
            try
            {
                var employee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.EmployeeID == employeeId);

                if (employee == null)
                {
                    return NotFound(new ApiResponse
                    {
                        Message = "Employee not found",
                        Success = false
                    });
                }

                if (!string.IsNullOrEmpty(request.Status))
                {
                    employee.Status = request.Status;
                    await _context.SaveChangesAsync();
                }

                return Ok(new ApiResponse
                {
                    Message = $"Employee status updated to {request.Status}"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse
                {
                    Message = "An error occurred while updating employee status",
                    Success = false
                });
            }
        }
    }
}