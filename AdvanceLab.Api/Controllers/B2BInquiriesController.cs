using AdvanceLab.Api.Data;
using AdvanceLab.Api.DTOs;
using AdvanceLab.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AdvanceLab.Api.Controllers;

[ApiController]
[Route("api/b2b-inquiries")]
public class B2BInquiriesController : ControllerBase
{
    private readonly AppDbContext _db;

    public B2BInquiriesController(AppDbContext db)
    {
        _db = db;
    }

    // Public: any hospital/clinic/corporate can submit a partnership inquiry.
    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<B2BInquiryResponse>> Create(CreateB2BInquiryRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.OrganizationName) ||
            string.IsNullOrWhiteSpace(request.ContactPerson) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Phone))
        {
            return BadRequest(new { message = "Organization name, contact person, email and phone are required." });
        }

        var inquiry = new B2BInquiry
        {
            OrganizationName = request.OrganizationName.Trim(),
            ContactPerson = request.ContactPerson.Trim(),
            Email = request.Email.Trim(),
            Phone = request.Phone.Trim(),
            BusinessType = request.BusinessType,
            City = request.City?.Trim(),
            Message = request.Message?.Trim(),
            Status = B2BInquiryStatus.New
        };

        _db.B2BInquiries.Add(inquiry);
        await _db.SaveChangesAsync();

        return Ok(ToResponse(inquiry));
    }

    // Admin only: pipeline of partnership inquiries.
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<B2BInquiryResponse>>> GetAll()
    {
        var inquiries = await _db.B2BInquiries.OrderByDescending(i => i.CreatedAt).ToListAsync();
        return Ok(inquiries.Select(ToResponse).ToList());
    }

    [HttpPatch("{id:int}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateStatus(int id, UpdateB2BInquiryStatusRequest request)
    {
        var inquiry = await _db.B2BInquiries.FindAsync(id);
        if (inquiry is null) return NotFound();

        inquiry.Status = request.Status;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var inquiry = await _db.B2BInquiries.FindAsync(id);
        if (inquiry is null) return NotFound();

        _db.B2BInquiries.Remove(inquiry);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static B2BInquiryResponse ToResponse(B2BInquiry i) => new(
        i.Id, i.OrganizationName, i.ContactPerson, i.Email, i.Phone, i.BusinessType, i.City, i.Message, i.Status, i.CreatedAt);
}
