using AdvanceLab.Api.Data;
using AdvanceLab.Api.DTOs;
using AdvanceLab.Api.Models;
using AdvanceLab.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AdvanceLab.Api.Controllers;

[ApiController]
[Route("api/appointments")]
public class AppointmentsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly EmailService _emailService;
    private readonly IConfiguration _config;

    public AppointmentsController(AppDbContext db, EmailService emailService, IConfiguration config)
    {
        _db = db;
        _emailService = emailService;
        _config = config;
    }

    // Public: anyone can book an appointment, no auth required.
    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<AppointmentResponse>> Create(CreateAppointmentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Address) ||
            string.IsNullOrWhiteSpace(request.PhoneNo))
        {
            return BadRequest(new { message = "Name, address and phone number are required." });
        }

        var appointment = new Appointment
        {
            Name = request.Name.Trim(),
            Address = request.Address.Trim(),
            PhoneNo = request.PhoneNo.Trim(),
            Email = request.Email?.Trim(),
            ServiceItemId = request.ServiceItemId,
            CollectionDateTime = request.CollectionDateTime,
            Description = request.Description?.Trim(),
            Status = AppointmentStatus.Pending
        };

        _db.Appointments.Add(appointment);
        await _db.SaveChangesAsync();

        var adminEmail = _config["Notifications:AdminEmail"];
        if (!string.IsNullOrWhiteSpace(adminEmail))
        {
            await _emailService.SendAsync(
                adminEmail,
                "New appointment booked",
                $"{appointment.Name} booked a sample collection for {appointment.CollectionDateTime:f}.\nPhone: {appointment.PhoneNo}\nAddress: {appointment.Address}");
        }

        if (!string.IsNullOrWhiteSpace(appointment.Email))
        {
            await _emailService.SendAsync(
                appointment.Email!,
                "Your appointment request — Advance Diagnostic Lab",
                $"Hi {appointment.Name},\n\nWe've received your request for sample collection on {appointment.CollectionDateTime:f}. We'll contact you shortly to confirm.\n\n— Advance Diagnostic Lab");
        }

        return Ok(ToResponse(appointment, null));
    }

    // Admin only: list all appointments.
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<AppointmentResponse>>> GetAll()
    {
        var appointments = await _db.Appointments
            .Include(a => a.ServiceItem)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return Ok(appointments.Select(a => ToResponse(a, a.ServiceItem?.Name)).ToList());
    }

    // Admin only: update status (Pending -> Confirmed -> Completed / Cancelled).
    // Cancelled (i.e. "reject") requires a reason so the patient can be told why.
    [HttpPatch("{id:int}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateStatus(int id, UpdateAppointmentStatusRequest request)
    {
        if (request.Status == AppointmentStatus.Cancelled && string.IsNullOrWhiteSpace(request.RejectionReason))
        {
            return BadRequest(new { message = "A reason is required when rejecting an appointment." });
        }

        var appointment = await _db.Appointments.FindAsync(id);
        if (appointment is null) return NotFound();

        appointment.Status = request.Status;
        appointment.RejectionReason = request.Status == AppointmentStatus.Cancelled ? request.RejectionReason!.Trim() : null;
        await _db.SaveChangesAsync();

        if (!string.IsNullOrWhiteSpace(appointment.Email) &&
            (request.Status == AppointmentStatus.Confirmed || request.Status == AppointmentStatus.Cancelled))
        {
            var subject = request.Status == AppointmentStatus.Confirmed
                ? "Your appointment is confirmed — Advance Diagnostic Lab"
                : "Your appointment could not be confirmed — Advance Diagnostic Lab";
            var body = request.Status == AppointmentStatus.Confirmed
                ? $"Hi {appointment.Name},\n\nYour sample collection on {appointment.CollectionDateTime:f} is confirmed. Our team will arrive as scheduled.\n\n— Advance Diagnostic Lab"
                : $"Hi {appointment.Name},\n\nWe're unable to confirm your appointment request for {appointment.CollectionDateTime:f}.\nReason: {appointment.RejectionReason}\n\nPlease contact us or book a new time.\n\n— Advance Diagnostic Lab";

            await _emailService.SendAsync(appointment.Email!, subject, body);
        }

        return NoContent();
    }

    // Admin only: delete an appointment record.
    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var appointment = await _db.Appointments.FindAsync(id);
        if (appointment is null) return NotFound();

        _db.Appointments.Remove(appointment);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static AppointmentResponse ToResponse(Appointment a, string? serviceItemName) => new(
        a.Id, a.Name, a.Address, a.PhoneNo, a.Email, a.ServiceItemId, serviceItemName,
        a.CollectionDateTime, a.Description, a.Status, a.RejectionReason, a.CreatedAt);
}
