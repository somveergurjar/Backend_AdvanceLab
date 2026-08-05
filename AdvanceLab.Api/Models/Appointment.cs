namespace AdvanceLab.Api.Models;

public enum AppointmentStatus
{
    Pending,
    Confirmed,
    Completed,
    Cancelled
}

public class Appointment
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string PhoneNo { get; set; } = string.Empty;
    public string? Email { get; set; }
    public int? ServiceItemId { get; set; }
    public ServiceItem? ServiceItem { get; set; }
    public DateTime CollectionDateTime { get; set; }
    public string? Description { get; set; }
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;
    public string? RejectionReason { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
