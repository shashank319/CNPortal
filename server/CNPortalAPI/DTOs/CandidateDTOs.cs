namespace CNPortalAPI.DTOs
{
    public class CreateCandidateRequest
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public string? Skills { get; set; }
        public int? Experience { get; set; }
        public string? Notes { get; set; }
        public decimal? HourlyRate { get; set; }
    }

    public class CreateCandidateResponse
    {
        public int CandidateId { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class UpdateCandidateRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? ClientName { get; set; }
        public string? Status { get; set; }
        public string? Skills { get; set; }
        public int? Experience { get; set; }
        public string? Notes { get; set; }
        public decimal? HourlyRate { get; set; }
    }

    public class CandidateListResponse
    {
        public List<CandidateSummary> Items { get; set; } = new();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int Total { get; set; }
    }

    public class CandidateSummary
    {
        public int CandidateId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Skills { get; set; }
        public int? Experience { get; set; }
        public decimal? HourlyRate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CandidateDetails
    {
        public int CandidateID { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public int EmployerID { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Skills { get; set; }
        public int? Experience { get; set; }
        public string? Resume { get; set; }
        public string? Notes { get; set; }
        public decimal? HourlyRate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public object? Employer { get; set; }
    }
}