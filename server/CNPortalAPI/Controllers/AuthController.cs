using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CNPortalAPI.Models;
using CNPortalAPI.DTOs;
using BCrypt.Net;

namespace CNPortalAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly CNPortalDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(CNPortalDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
        {
            try
            {
                var employee = await _context.Employees
                    .Include(e => e.Identity)
                    .FirstOrDefaultAsync(e => e.Email == request.Email);

                if (employee == null)
                {
                    return Unauthorized(new LoginResponse
                    {
                        Message = "Invalid email or password",
                        RequirePasswordChange = false
                    });
                }

                // Verify password
                bool isValidPassword = BCrypt.Net.BCrypt.Verify(request.Password, employee.PasswordHash);
                if (!isValidPassword)
                {
                    return Unauthorized(new LoginResponse
                    {
                        Message = "Invalid email or password",
                        RequirePasswordChange = false
                    });
                }

                // Check if first time login
                if (employee.FirstTimeFlag)
                {
                    return Ok(new LoginResponse
                    {
                        EmployeeId = employee.EmployeeID,
                        RequirePasswordChange = true,
                        Message = "Password change required"
                    });
                }

                // Generate JWT token
                var token = GenerateJwtToken(employee);

                return Ok(new LoginResponse
                {
                    EmployeeId = employee.EmployeeID,
                    RequirePasswordChange = false,
                    Token = token,
                    Role = employee.Identity.Role,
                    Message = "Login successful"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new LoginResponse
                {
                    Message = "An error occurred during login",
                    RequirePasswordChange = false
                });
            }
        }

        [HttpPost("change-password")]
        public async Task<ActionResult<ApiResponse>> ChangePassword(ChangePasswordRequest request)
        {
            try
            {
                var employee = await _context.Employees.FindAsync(request.EmployeeId);
                if (employee == null)
                {
                    return NotFound(new ApiResponse
                    {
                        Message = "Employee not found",
                        Success = false
                    });
                }

                // If not first time, verify current password
                if (!employee.FirstTimeFlag && !string.IsNullOrEmpty(request.CurrentPassword))
                {
                    bool isCurrentPasswordValid = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, employee.PasswordHash);
                    if (!isCurrentPasswordValid)
                    {
                        return BadRequest(new ApiResponse
                        {
                            Message = "Current password is incorrect",
                            Success = false
                        });
                    }
                }

                // Hash new password
                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

                // Update employee
                employee.PasswordHash = hashedPassword;
                employee.FirstTimeFlag = false;

                await _context.SaveChangesAsync();

                return Ok(new ApiResponse { Message = "Password updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse
                {
                    Message = "An error occurred while updating password",
                    Success = false
                });
            }
        }

        [HttpPost("forgot-password")]
        public async Task<ActionResult<ApiResponse>> ForgotPassword(ForgotPasswordRequest request)
        {
            try
            {
                var employee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.Email == request.Email);

                // Always return success for security reasons
                // In a real implementation, you would send an email with a reset token
                return Ok(new ApiResponse
                {
                    Message = "If the account exists, a reset email was sent."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse
                {
                    Message = "An error occurred",
                    Success = false
                });
            }
        }

        [HttpPost("reset-password")]
        public async Task<ActionResult<ApiResponse>> ResetPassword(ResetPasswordRequest request)
        {
            try
            {
                // In a real implementation, you would validate the reset token
                // For now, this is a placeholder implementation
                return Ok(new ApiResponse { Message = "Password reset successful" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse
                {
                    Message = "An error occurred during password reset",
                    Success = false
                });
            }
        }

        private string GenerateJwtToken(Employee employee)
        {
            var jwtKey = _configuration["Jwt:Key"];
            var jwtIssuer = _configuration["Jwt:Issuer"];
            var jwtAudience = _configuration["Jwt:Audience"];
            var expiryHours = int.Parse(_configuration["Jwt:ExpiryInHours"] ?? "24");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, employee.EmployeeID.ToString()),
                new Claim(ClaimTypes.Email, employee.Email),
                new Claim(ClaimTypes.Role, employee.Identity.Role),
                new Claim(ClaimTypes.Name, $"{employee.FirstName} {employee.LastName}")
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.Now.AddHours(expiryHours),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}