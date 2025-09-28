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
    public class CandidatesController : ControllerBase
    {
        private readonly CNPortalDbContext _context;

        public CandidatesController(CNPortalDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<CreateCandidateResponse>> CreateCandidate(CreateCandidateRequest request)
        {
            try
            {
                // Get current user's employee ID
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out int employerId))
                {
                    return BadRequest(new CreateCandidateResponse
                    {
                        Message = "Invalid user authentication"
                    });
                }

                // Check if email already exists
                var existingCandidate = await _context.Candidates
                    .FirstOrDefaultAsync(c => c.Email == request.Email);

                if (existingCandidate != null)
                {
                    return BadRequest(new CreateCandidateResponse
                    {
                        Message = "Candidate with this email already exists"
                    });
                }

                // Create candidate
                var candidate = new Candidate
                {
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Email = request.Email,
                    PhoneNumber = request.PhoneNumber,
                    ClientName = request.ClientName,
                    EmployerID = employerId,
                    Status = "active",
                    Skills = request.Skills,
                    Experience = request.Experience,
                    Notes = request.Notes,
                    HourlyRate = request.HourlyRate,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Candidates.Add(candidate);
                await _context.SaveChangesAsync();

                return Ok(new CreateCandidateResponse
                {
                    CandidateId = candidate.CandidateID,
                    Message = "Candidate created successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new CreateCandidateResponse
                {
                    Message = "An error occurred while creating candidate"
                });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CandidateDetails>> GetCandidate(int id)
        {
            try
            {
                var candidate = await _context.Candidates
                    .Include(c => c.Employer)
                    .FirstOrDefaultAsync(c => c.CandidateID == id);

                if (candidate == null)
                {
                    return NotFound(new ApiResponse
                    {
                        Message = "Candidate not found",
                        Success = false
                    });
                }

                var candidateDetails = new CandidateDetails
                {
                    CandidateID = candidate.CandidateID,
                    FirstName = candidate.FirstName,
                    LastName = candidate.LastName,
                    Email = candidate.Email,
                    PhoneNumber = candidate.PhoneNumber,
                    ClientName = candidate.ClientName,
                    EmployerID = candidate.EmployerID,
                    Status = candidate.Status,
                    Skills = candidate.Skills,
                    Experience = candidate.Experience,
                    Resume = candidate.Resume,
                    Notes = candidate.Notes,
                    HourlyRate = candidate.HourlyRate,
                    CreatedAt = candidate.CreatedAt,
                    UpdatedAt = candidate.UpdatedAt,
                    Employer = candidate.Employer != null ? new {
                        EmployeeID = candidate.Employer.EmployeeID,
                        FirstName = candidate.Employer.FirstName,
                        LastName = candidate.Employer.LastName,
                        Email = candidate.Employer.Email
                    } : null
                };

                return Ok(candidateDetails);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse
                {
                    Message = "An error occurred while retrieving candidate details",
                    Success = false
                });
            }
        }

        [HttpGet]
        public async Task<ActionResult<CandidateListResponse>> GetCandidates(
            [FromQuery] string? email = null,
            [FromQuery] string? status = null,
            [FromQuery] string? clientName = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var query = _context.Candidates.AsQueryable();

                // Apply filters
                if (!string.IsNullOrEmpty(email))
                    query = query.Where(c => c.Email.Contains(email));

                if (!string.IsNullOrEmpty(status))
                    query = query.Where(c => c.Status == status);

                if (!string.IsNullOrEmpty(clientName))
                    query = query.Where(c => c.ClientName.Contains(clientName));

                var total = await query.CountAsync();

                var candidates = await query
                    .OrderByDescending(c => c.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(c => new CandidateSummary
                    {
                        CandidateId = c.CandidateID,
                        FirstName = c.FirstName,
                        LastName = c.LastName,
                        Email = c.Email,
                        PhoneNumber = c.PhoneNumber,
                        ClientName = c.ClientName,
                        Status = c.Status,
                        Skills = c.Skills,
                        Experience = c.Experience,
                        HourlyRate = c.HourlyRate,
                        CreatedAt = c.CreatedAt,
                        UpdatedAt = c.UpdatedAt
                    })
                    .ToListAsync();

                return Ok(new CandidateListResponse
                {
                    Items = candidates,
                    Page = page,
                    PageSize = pageSize,
                    Total = total
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new CandidateListResponse
                {
                    Items = new List<CandidateSummary>()
                });
            }
        }

        [HttpPut("{candidateId}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<ApiResponse>> UpdateCandidate(int candidateId, UpdateCandidateRequest request)
        {
            try
            {
                var candidate = await _context.Candidates
                    .FirstOrDefaultAsync(c => c.CandidateID == candidateId);

                if (candidate == null)
                {
                    return NotFound(new ApiResponse
                    {
                        Message = "Candidate not found",
                        Success = false
                    });
                }

                // Update candidate fields
                if (!string.IsNullOrEmpty(request.FirstName))
                    candidate.FirstName = request.FirstName;

                if (!string.IsNullOrEmpty(request.LastName))
                    candidate.LastName = request.LastName;

                if (!string.IsNullOrEmpty(request.Email))
                {
                    // Check if new email is already taken by another candidate
                    var existingCandidate = await _context.Candidates
                        .FirstOrDefaultAsync(c => c.Email == request.Email && c.CandidateID != candidateId);

                    if (existingCandidate != null)
                    {
                        return BadRequest(new ApiResponse
                        {
                            Message = "Email already exists for another candidate",
                            Success = false
                        });
                    }
                    candidate.Email = request.Email;
                }

                if (!string.IsNullOrEmpty(request.PhoneNumber))
                    candidate.PhoneNumber = request.PhoneNumber;

                if (!string.IsNullOrEmpty(request.ClientName))
                    candidate.ClientName = request.ClientName;

                if (!string.IsNullOrEmpty(request.Status))
                    candidate.Status = request.Status;

                if (request.Skills != null)
                    candidate.Skills = request.Skills;

                if (request.Experience.HasValue)
                    candidate.Experience = request.Experience.Value;

                if (request.Notes != null)
                    candidate.Notes = request.Notes;

                if (request.HourlyRate.HasValue)
                    candidate.HourlyRate = request.HourlyRate.Value;

                candidate.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new ApiResponse { Message = "Candidate updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse
                {
                    Message = "An error occurred while updating candidate",
                    Success = false
                });
            }
        }

        [HttpDelete("{candidateId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse>> DeleteCandidate(int candidateId)
        {
            try
            {
                var candidate = await _context.Candidates
                    .FirstOrDefaultAsync(c => c.CandidateID == candidateId);

                if (candidate == null)
                {
                    return NotFound(new ApiResponse
                    {
                        Message = "Candidate not found",
                        Success = false
                    });
                }

                _context.Candidates.Remove(candidate);
                await _context.SaveChangesAsync();

                return Ok(new ApiResponse { Message = "Candidate deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse
                {
                    Message = "An error occurred while deleting candidate",
                    Success = false
                });
            }
        }
    }
}