using AdvanceLab.Api.Data;
using AdvanceLab.Api.DTOs;
using AdvanceLab.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AdvanceLab.Api.Controllers;

[ApiController]
[Route("api/testimonials")]
public class TestimonialsController : ControllerBase
{
    private readonly AppDbContext _db;

    public TestimonialsController(AppDbContext db)
    {
        _db = db;
    }

    // Public: only active testimonials, for the homepage.
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<TestimonialResponse>>> GetActive()
    {
        var testimonials = await _db.Testimonials
            .Where(t => t.IsActive)
            .OrderBy(t => t.SortOrder)
            .ToListAsync();

        return Ok(testimonials.Select(ToResponse).ToList());
    }

    // Admin only: every testimonial, active or not.
    [HttpGet("all")]
    [Authorize]
    public async Task<ActionResult<List<TestimonialResponse>>> GetAll()
    {
        var testimonials = await _db.Testimonials.OrderBy(t => t.SortOrder).ToListAsync();
        return Ok(testimonials.Select(ToResponse).ToList());
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<TestimonialResponse>> Create(UpsertTestimonialRequest request)
    {
        var testimonial = new Testimonial
        {
            CustomerName = request.CustomerName,
            RoleOrLocation = request.RoleOrLocation,
            Quote = request.Quote,
            Rating = request.Rating,
            SortOrder = request.SortOrder,
            IsActive = request.IsActive
        };
        _db.Testimonials.Add(testimonial);
        await _db.SaveChangesAsync();
        return Ok(ToResponse(testimonial));
    }

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, UpsertTestimonialRequest request)
    {
        var testimonial = await _db.Testimonials.FindAsync(id);
        if (testimonial is null) return NotFound();

        testimonial.CustomerName = request.CustomerName;
        testimonial.RoleOrLocation = request.RoleOrLocation;
        testimonial.Quote = request.Quote;
        testimonial.Rating = request.Rating;
        testimonial.SortOrder = request.SortOrder;
        testimonial.IsActive = request.IsActive;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var testimonial = await _db.Testimonials.FindAsync(id);
        if (testimonial is null) return NotFound();

        _db.Testimonials.Remove(testimonial);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static TestimonialResponse ToResponse(Testimonial t) =>
        new(t.Id, t.CustomerName, t.RoleOrLocation, t.Quote, t.Rating, t.SortOrder, t.IsActive);
}
