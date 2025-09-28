namespace CNPortalAPI.DTOs
{
    public class TimesheetListResponse
    {
        public List<TimesheetSummary> Items { get; set; } = new();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int Total { get; set; }
    }

    public class TimesheetSummary
    {
        public int IndexId { get; set; }
        public int EmployeeId { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public decimal TotalHoursWorked { get; set; }
        public bool ApprovalL1 { get; set; }
        public bool ApprovalL2 { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class TimesheetDetailResponse
    {
        public TimesheetHeader Header { get; set; } = new();
        public List<TimesheetEntry> Entries { get; set; } = new();
        public List<AttachmentInfo> Attachments { get; set; } = new();
    }

    public class TimesheetHeader
    {
        public int IndexId { get; set; }
        public int EmployeeId { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public decimal TotalHoursWorked { get; set; }
        public bool ApprovalL1 { get; set; }
        public bool ApprovalL2 { get; set; }
        public string? Comments { get; set; }
        public decimal RatePerHour { get; set; }
    }

    public class TimesheetEntry
    {
        public int TimesheetId { get; set; }
        public DateTime Date { get; set; }
        public decimal HoursWorked { get; set; }
    }

    public class AttachmentInfo
    {
        public string FileName { get; set; } = string.Empty;
        public long Size { get; set; }
        public string ContentType { get; set; } = string.Empty;
        public string? SasUrl { get; set; }
    }

    public class CreateTimesheetRequest
    {
        public int EmployeeId { get; set; }
        public DateTime PeriodStart { get; set; }
        public DateTime PeriodEnd { get; set; }
        public List<TimesheetEntryRequest> Entries { get; set; } = new();
        public AttachmentRequest? Attachment { get; set; }
        public bool Submit { get; set; }
    }

    public class TimesheetEntryRequest
    {
        public DateTime Date { get; set; }
        public decimal HoursWorked { get; set; }
    }

    public class AttachmentRequest
    {
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public string Base64 { get; set; } = string.Empty;
    }

    public class UpdateTimesheetRequest
    {
        public List<TimesheetEntryRequest> Entries { get; set; } = new();
        public string? Comments { get; set; }
        public bool Resubmit { get; set; }
    }

    public class BulkUpdateEntriesRequest
    {
        public List<TimesheetEntryRequest> Entries { get; set; } = new();
    }

    public class SubmitTimesheetResponse
    {
        public string Message { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }

    public class ApprovalRequest
    {
        public int Level { get; set; }
        public string? Comment { get; set; }
    }

    public class ApprovalResponse
    {
        public bool ApprovalL1 { get; set; }
        public bool ApprovalL2 { get; set; }
        public string? Comments { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}