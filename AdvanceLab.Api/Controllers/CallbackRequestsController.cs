using System.Text.RegularExpressions;
using AdvanceLab.Api.Data;
using AdvanceLab.Api.DTOs;
using AdvanceLab.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AdvanceLab.Api.Controllers;

[ApiController]
[Route("api/callback-requests")]
public class CallbackRequestsController : ControllerBase
{
    private readonly AppDbContext _db;

    public CallbackRequestsController(AppDbContext db)
    {
        _db = db;
    }

    // Public: the home page's "Enter your number, we'll call you back" widget.
    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<CallbackRequestResponse>> Create(CreateCallbackRequestRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.PhoneNo) || !Regex.IsMatch(request.PhoneNo.Trim(), @"^\d{10}$"))
        {
            return BadRequest(new { message = "Enter a valid 10-digit phone number." });
        }

        var callback = new CallbackRequest
        {
            Name = request.Name?.Trim(),
            PhoneNo = request.PhoneNo.Trim()
        };
        _db.CallbackRequests.Add(callback);
        await _db.SaveChangesAsync();

        return Ok(ToResponse(callback));
    }

    // Admin only: inbox of callback requests.
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<CallbackRequestResponse>>> GetAll()
    {
        var requests = await _db.CallbackRequests.OrderByDescending(r => r.CreatedAt).ToListAsync();
        return Ok(requests.Select(ToResponse).ToList());
    }

    [HttpPatch("{id:int}/contacted")]
    [Authorize]
    public async Task<IActionResult> MarkContacted(int id)
    {
        var request = await _db.CallbackRequests.FindAsync(id);
        if (request is null) return NotFound();

        request.IsContacted = true;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var request = await _db.CallbackRequests.FindAsync(id);
        if (request is null) return NotFound();

        _db.CallbackRequests.Remove(request);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static CallbackRequestResponse ToResponse(CallbackRequest r) =>
        new(r.Id, r.Name, r.PhoneNo, r.IsContacted, r.CreatedAt);
}
