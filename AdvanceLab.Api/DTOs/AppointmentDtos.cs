using AdvanceLab.Api.Models;

namespace AdvanceLab.Api.DTOs;

public record CreateAppointmentRequest(
    string Name,
    string Address,
    string PhoneNo,
    string? Email,
    int? ServiceItemId,
    DateTime CollectionDateTime,
    string? Description);

public record AppointmentResponse(
    int Id,
    string Name,
    string Address,
    string PhoneNo,
    string? Email,
    int? ServiceItemId,
    string? ServiceItemName,
    DateTime CollectionDateTime,
    string? Description,
    AppointmentStatus Status,
    string? RejectionReason,
    DateTime CreatedAt);

public record UpdateAppointmentStatusRequest(AppointmentStatus Status, string? RejectionReason);
