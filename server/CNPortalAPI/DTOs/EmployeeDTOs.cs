namespace CNPortalAPI.DTOs
{
    public class CreateEmployeeRequest
    {
        public string CompanyName { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string? MiddleName { get; set; }
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string TemporaryPassword { get; set; } = string.Empty;
        public bool FirstTimeFlag { get; set; } = true;
        public string VendorName { get; set; } = string.Empty;
        public decimal RatePerHour { get; set; }
    }

    public class CreateEmployeeResponse
    {
        public int EmployeeId { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class UpdateEmployeeRequest
    {
        public string? FirstName { get; set; }
        public string? MiddleName { get; set; }
        public string? LastName { get; set; }
        public string? Role { get; set; }
        public string? Status { get; set; }
        public decimal? RatePerHour { get; set; }
    }

    public class EmployeeListResponse
    {
        public List<EmployeeSummary> Items { get; set; } = new();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int Total { get; set; }
    }

    public class EmployeeSummary
    {
        public int EmployeeId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string? MiddleName { get; set; }
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public decimal RatePerHour { get; set; }
    }

    public class UpdateRoleRequest
    {
        public string Role { get; set; } = string.Empty;
    }

    public class EmployeeDetails
    {
        public int EmployeeID { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string? MiddleName { get; set; }
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool FirstTimeFlag { get; set; }
        public string Status { get; set; } = string.Empty;
        public int IdentityID { get; set; }
        public int? VendorID { get; set; }
        public object Identity { get; set; } = new();
        public object? Vendor { get; set; }
    }
}