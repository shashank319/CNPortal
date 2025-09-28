namespace CNPortalAPI.DTOs
{
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public int EmployeeId { get; set; }
        public bool RequirePasswordChange { get; set; }
        public string? Token { get; set; }
        public string? Role { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class ChangePasswordRequest
    {
        public int EmployeeId { get; set; }
        public string? CurrentPassword { get; set; }
        public string NewPassword { get; set; } = string.Empty;
    }

    public class ForgotPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordRequest
    {
        public string Token { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class ApiResponse
    {
        public string Message { get; set; } = string.Empty;
        public bool Success { get; set; } = true;
    }
}