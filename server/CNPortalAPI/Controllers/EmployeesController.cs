using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using CNPortalAPI.Models;
using CNPortalAPI.DTOs;
using BCrypt.Net;

namespace CNPortalAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EmployeesController : ControllerBase
    {
        private readonly CNPortalDbContext _context;

        public EmployeesController(CNPortalDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<CreateEmployeeResponse>> CreateEmployee(CreateEmployeeRequest request)
        {
            try
            {
                // Check if email already exists
                var existingEmployee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.Email == request.Email);

                if (existingEmployee != null)
                {
                    return BadRequest(new CreateEmployeeResponse
                    {
                        Message = "Employee with this email already exists"
                    });
                }

                // Get or create identity role
                var identity = await _context.Identities
                    .FirstOrDefaultAsync(i => i.Role == request.Role);

                if (identity == null)
                {
                    return BadRequest(new CreateEmployeeResponse
                    {
                        Message = "Invalid role specified"
                    });
                }

                // Create employee
                var employee = new Employee
                {
                    CompanyName = request.CompanyName,
                    FirstName = request.FirstName,
                    MiddleName = request.MiddleName,
                    LastName = request.LastName,
                    Email = request.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.TemporaryPassword),
                    FirstTimeFlag = request.FirstTimeFlag,
                    Status = "Active",
                    IdentityID = identity.IdentityID
                };

                _context.Employees.Add(employee);
                await _context.SaveChangesAsync();

                // Create vendor record
                var vendor = new Vendor
                {
                    EmployeeID = employee.EmployeeID,
                    VendorName = request.VendorName,
                    RatePerHour = request.RatePerHour
                };

                _context.Vendors.Add(vendor);

                // Update employee with vendor ID
                employee.VendorID = vendor.VendorID;
                await _context.SaveChangesAsync();

                return Ok(new CreateEmployeeResponse
                {
                    EmployeeId = employee.EmployeeID,
                    Message = "Employee created successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new CreateEmployeeResponse
                {
                    Message = "An error occurred while creating employee"
                });
            }
        }

        [HttpPut("{employeeId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse>> UpdateEmployee(int employeeId, UpdateEmployeeRequest request)
        {
            try
            {
                var employee = await _context.Employees
                    .Include(e => e.Vendor)
                    .FirstOrDefaultAsync(e => e.EmployeeID == employeeId);

                if (employee == null)
                {
                    return NotFound(new ApiResponse
                    {
                        Message = "Employee not found",
                        Success = false
                    });
                }

                // Update employee fields
                if (!string.IsNullOrEmpty(request.FirstName))
                    employee.FirstName = request.FirstName;

                if (request.MiddleName != null)
                    employee.MiddleName = request.MiddleName;

                if (!string.IsNullOrEmpty(request.LastName))
                    employee.LastName = request.LastName;

                if (!string.IsNullOrEmpty(request.Status))
                    employee.Status = request.Status;

                // Update role if specified
                if (!string.IsNullOrEmpty(request.Role))
                {
                    var identity = await _context.Identities
                        .FirstOrDefaultAsync(i => i.Role == request.Role);

                    if (identity != null)
                    {
                        employee.IdentityID = identity.IdentityID;
                    }
                }

                // Update rate if specified
                if (request.RatePerHour.HasValue && employee.Vendor != null)
                {
                    employee.Vendor.RatePerHour = request.RatePerHour.Value;
                }

                await _context.SaveChangesAsync();

                return Ok(new ApiResponse { Message = "Employee updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse
                {
                    Message = "An error occurred while updating employee",
                    Success = false
                });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<EmployeeDetails>> GetEmployee(int id)
        {
            try
            {
                var employee = await _context.Employees
                    .Include(e => e.Identity)
                    .Include(e => e.Vendor)
                    .FirstOrDefaultAsync(e => e.EmployeeID == id);

                if (employee == null)
                {
                    return NotFound(new ApiResponse
                    {
                        Message = "Employee not found",
                        Success = false
                    });
                }

                var employeeDetails = new EmployeeDetails
                {
                    EmployeeID = employee.EmployeeID,
                    CompanyName = employee.CompanyName,
                    FirstName = employee.FirstName,
                    MiddleName = employee.MiddleName,
                    LastName = employee.LastName,
                    Email = employee.Email,
                    FirstTimeFlag = employee.FirstTimeFlag,
                    Status = employee.Status,
                    IdentityID = employee.IdentityID,
                    VendorID = employee.VendorID,
                    Identity = new { IdentityID = employee.Identity.IdentityID, Role = employee.Identity.Role },
                    Vendor = employee.Vendor != null ? new { VendorID = employee.Vendor.VendorID, VendorName = employee.Vendor.VendorName, RatePerHour = employee.Vendor.RatePerHour } : null
                };

                return Ok(employeeDetails);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse
                {
                    Message = "An error occurred while retrieving employee details",
                    Success = false
                });
            }
        }

        [HttpGet]
        public async Task<ActionResult<EmployeeListResponse>> GetEmployees(
            [FromQuery] string? email = null,
            [FromQuery] string? role = null,
            [FromQuery] string? company = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var query = _context.Employees
                    .Include(e => e.Identity)
                    .Include(e => e.Vendor)
                    .AsQueryable();

                // Apply filters
                if (!string.IsNullOrEmpty(email))
                    query = query.Where(e => e.Email.Contains(email));

                if (!string.IsNullOrEmpty(role))
                    query = query.Where(e => e.Identity.Role == role);

                if (!string.IsNullOrEmpty(company))
                    query = query.Where(e => e.CompanyName.Contains(company));

                var total = await query.CountAsync();

                var employees = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(e => new EmployeeSummary
                    {
                        EmployeeId = e.EmployeeID,
                        FirstName = e.FirstName,
                        MiddleName = e.MiddleName,
                        LastName = e.LastName,
                        Email = e.Email,
                        Role = e.Identity.Role,
                        Status = e.Status,
                        CompanyName = e.CompanyName,
                        RatePerHour = e.Vendor != null ? e.Vendor.RatePerHour : 0
                    })
                    .ToListAsync();

                return Ok(new EmployeeListResponse
                {
                    Items = employees,
                    Page = page,
                    PageSize = pageSize,
                    Total = total
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new EmployeeListResponse
                {
                    Items = new List<EmployeeSummary>()
                });
            }
        }
    }
}