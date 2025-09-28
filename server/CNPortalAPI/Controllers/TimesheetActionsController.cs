using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using CNPortalAPI.Models;
using CNPortalAPI.DTOs;
using System.Security.Claims;

namespace CNPortalAPI.Controllers
{
    [ApiController]
    [Route("api/timesheets")]
    [Authorize]
    public class TimesheetActionsController : ControllerBase
    {
        private readonly CNPortalDbContext _context;

        public TimesheetActionsController(CNPortalDbContext context)
        {
            _context = context;
        }

        [HttpPost("{indexId}/attachments")]
        public async Task<ActionResult<AttachmentInfo>> UploadAttachment(int indexId, [FromBody] AttachmentRequest request)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

                var timesheet = await _context.MasterTimeSheets
                    .FirstOrDefaultAsync(m => m.IndexID == indexId);

                if (timesheet == null)
                {
                    return NotFound();
                }

                // Check permissions
                if (userRole == "Emp" && timesheet.EmployeeID != currentUserId)
                {
                    return Forbid();
                }

                // Validate file type
                var allowedTypes = new[] { "application/pdf", "image/jpeg", "image/jpg", "image/png" };
                if (!allowedTypes.Contains(request.ContentType.ToLower()))
                {
                    return BadRequest(new { Message = "File type not allowed. Only PDF, JPG, and PNG files are supported." });
                }

                // Generate unique filename
                var fileExtension = Path.GetExtension(request.FileName);
                var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";

                // In a real implementation, you would save to Azure File Share
                // For now, just update the database record
                timesheet.FileName = uniqueFileName;
                timesheet.StorageAccount = "Azure";
                timesheet.ModifiedDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new AttachmentInfo
                {
                    FileName = uniqueFileName,
                    Size = request.Base64.Length * 3 / 4, // Approximate size from base64
                    ContentType = request.ContentType,
                    SasUrl = $"https://storage.example.com/timesheets/{timesheet.EmployeeID}/{indexId}/{uniqueFileName}" // Placeholder URL
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while uploading attachment" });
            }
        }

        [HttpPost("{indexId}/submit")]
        public async Task<ActionResult<SubmitTimesheetResponse>> SubmitTimesheet(int indexId)
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
                    return NotFound();
                }

                // Check permissions
                if (userRole == "Emp" && timesheet.EmployeeID != currentUserId)
                {
                    return Forbid();
                }

                // Validate timesheet has entries
                if (!timesheet.EveryDayTimesheets.Any())
                {
                    return BadRequest(new SubmitTimesheetResponse
                    {
                        Message = "Cannot submit timesheet without entries"
                    });
                }

                // Validate total hours
                if (timesheet.TotalHoursWorked <= 0)
                {
                    return BadRequest(new SubmitTimesheetResponse
                    {
                        Message = "Cannot submit timesheet with zero hours"
                    });
                }

                // Mark as submitted (reset any previous approvals for resubmission)
                timesheet.ApprovalL1 = false;
                timesheet.ApprovalL2 = false;
                timesheet.ModifiedDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new SubmitTimesheetResponse
                {
                    Message = "Timesheet submitted for approval",
                    Status = "Submitted"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new SubmitTimesheetResponse
                {
                    Message = "An error occurred while submitting timesheet"
                });
            }
        }

        [HttpPost("{indexId}/approve")]
        [Authorize(Roles = "Admin,Manager,Client")]
        public async Task<ActionResult<ApprovalResponse>> ApproveTimesheet(int indexId, ApprovalRequest request)
        {
            try
            {
                var timesheet = await _context.MasterTimeSheets
                    .FirstOrDefaultAsync(m => m.IndexID == indexId);

                if (timesheet == null)
                {
                    return NotFound();
                }

                // Validate approval level
                if (request.Level != 1 && request.Level != 2)
                {
                    return BadRequest(new ApprovalResponse
                    {
                        Message = "Invalid approval level. Must be 1 or 2."
                    });
                }

                // Check if previous level is approved (for level 2)
                if (request.Level == 2 && !timesheet.ApprovalL1)
                {
                    return BadRequest(new ApprovalResponse
                    {
                        Message = "Level 1 approval required before Level 2 approval"
                    });
                }

                // Update approval level
                if (request.Level == 1)
                {
                    timesheet.ApprovalL1 = true;
                }
                else if (request.Level == 2)
                {
                    timesheet.ApprovalL2 = true;
                }

                // Update comments
                if (!string.IsNullOrEmpty(request.Comment))
                {
                    timesheet.Comments = string.IsNullOrEmpty(timesheet.Comments)
                        ? request.Comment
                        : $"{timesheet.Comments}\n\nLevel {request.Level} Approval: {request.Comment}";
                }

                timesheet.ModifiedDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                var status = GetTimesheetStatus(timesheet.ApprovalL1, timesheet.ApprovalL2);

                return Ok(new ApprovalResponse
                {
                    ApprovalL1 = timesheet.ApprovalL1,
                    ApprovalL2 = timesheet.ApprovalL2,
                    Comments = timesheet.Comments,
                    Message = $"Timesheet approved at level {request.Level}. Status: {status}"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApprovalResponse
                {
                    Message = "An error occurred while approving timesheet"
                });
            }
        }

        [HttpPost("{indexId}/reject")]
        [Authorize(Roles = "Admin,Manager,Client")]
        public async Task<ActionResult<ApprovalResponse>> RejectTimesheet(int indexId, ApprovalRequest request)
        {
            try
            {
                var timesheet = await _context.MasterTimeSheets
                    .FirstOrDefaultAsync(m => m.IndexID == indexId);

                if (timesheet == null)
                {
                    return NotFound();
                }

                // Validate rejection comment
                if (string.IsNullOrEmpty(request.Comment))
                {
                    return BadRequest(new ApprovalResponse
                    {
                        Message = "Rejection comment is required"
                    });
                }

                // Reset approvals and add comment
                timesheet.ApprovalL1 = false;
                timesheet.ApprovalL2 = false;
                timesheet.Comments = string.IsNullOrEmpty(timesheet.Comments)
                    ? $"Rejected: {request.Comment}"
                    : $"{timesheet.Comments}\n\nRejected: {request.Comment}";
                timesheet.ModifiedDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new ApprovalResponse
                {
                    ApprovalL1 = false,
                    ApprovalL2 = false,
                    Comments = timesheet.Comments,
                    Message = "Timesheet rejected and sent back for revision"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApprovalResponse
                {
                    Message = "An error occurred while rejecting timesheet"
                });
            }
        }

        private static string GetTimesheetStatus(bool approvalL1, bool approvalL2)
        {
            if (approvalL1 && approvalL2)
                return "Fully Approved";
            else if (approvalL1)
                return "Level 1 Approved";
            else
                return "Pending Approval";
        }
    }
}