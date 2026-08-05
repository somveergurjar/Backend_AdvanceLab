using AdvanceLab.Api.Data;
using AdvanceLab.Api.DTOs;
using AdvanceLab.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AdvanceLab.Api.Controllers;

[ApiController]
[Route("api/contact-messages")]
public class ContactMessagesController : ControllerBase
{
    private readonly AppDbContext _db;

    public ContactMessagesController(AppDbContext db)
    {
        _db = db;
    }

    // Public: anyone can submit a message via the Contact Us form.
    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<ContactMessageResponse>> Create(CreateContactMessageRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { message = "Name and message are required." });
        }

        var entity = new ContactMessage
        {
            Name = request.Name.Trim(),
            Email = request.Email?.Trim(),
            Phone = request.Phone?.Trim(),
            Message = request.Message.Trim()
        };
        _db.ContactMessages.Add(entity);
        await _db.SaveChangesAsync();
        return Ok(ToResponse(entity));
    }

    // Admin only: inbox of submitted messages.
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<ContactMessageResponse>>> GetAll()
    {
        var messages = await _db.ContactMessages.OrderByDescending(m => m.CreatedAt).ToListAsync();
        return Ok(messages.Select(ToResponse).ToList());
    }

    [HttpPatch("{id:int}/read")]
    [Authorize]
    public async Task<IActionResult> MarkRead(int id)
    {
        var message = await _db.ContactMessages.FindAsync(id);
        if (message is null) return NotFound();

        message.IsRead = true;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var message = await _db.ContactMessages.FindAsync(id);
        if (message is null) return NotFound();

        _db.ContactMessages.Remove(message);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static ContactMessageResponse ToResponse(ContactMessage m) =>
        new(m.Id, m.Name, m.Email, m.Phone, m.Message, m.IsRead, m.CreatedAt);
}
