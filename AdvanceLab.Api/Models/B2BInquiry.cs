namespace AdvanceLab.Api.Models;

public enum B2BBusinessType
{
    HospitalClinic,
    Corporate
}

public enum B2BInquiryStatus
{
    New,
    Contacted,
    Closed
}

public class B2BInquiry
{
    public int Id { get; set; }
    public string OrganizationName { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public B2BBusinessType BusinessType { get; set; }
    public string? City { get; set; }
    public string? Message { get; set; }
    public B2BInquiryStatus Status { get; set; } = B2BInquiryStatus.New;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
