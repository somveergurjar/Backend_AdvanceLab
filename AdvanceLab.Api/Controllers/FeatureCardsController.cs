using AdvanceLab.Api.Data;
using AdvanceLab.Api.DTOs;
using AdvanceLab.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AdvanceLab.Api.Controllers;

[ApiController]
[Route("api/features")]
public class FeatureCardsController : ControllerBase
{
    private readonly AppDbContext _db;

    public FeatureCardsController(AppDbContext db)
    {
        _db = db;
    }

    // Public: only active cards for a given page, in order.
    [HttpGet("{pageSlug}")]
    [AllowAnonymous]
    public async Task<ActionResult<List<FeatureCardResponse>>> GetForPage(string pageSlug)
    {
        var cards = await _db.FeatureCards
            .Where(c => c.PageSlug == pageSlug && c.IsActive)
            .OrderBy(c => c.SortOrder)
            .ToListAsync();

        return Ok(cards.Select(ToResponse).ToList());
    }

    // Admin only: every card for a page, active or not.
    [HttpGet("{pageSlug}/all")]
    [Authorize]
    public async Task<ActionResult<List<FeatureCardResponse>>> GetAllForPage(string pageSlug)
    {
        var cards = await _db.FeatureCards
            .Where(c => c.PageSlug == pageSlug)
            .OrderBy(c => c.SortOrder)
            .ToListAsync();

        return Ok(cards.Select(ToResponse).ToList());
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<FeatureCardResponse>> Create(UpsertFeatureCardRequest request)
    {
        var card = new FeatureCard
        {
            PageSlug = request.PageSlug,
            IconKey = request.IconKey,
            Title = request.Title,
            Body = request.Body,
            SortOrder = request.SortOrder,
            IsActive = request.IsActive
        };
        _db.FeatureCards.Add(card);
        await _db.SaveChangesAsync();
        return Ok(ToResponse(card));
    }

    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, UpsertFeatureCardRequest request)
    {
        var card = await _db.FeatureCards.FindAsync(id);
        if (card is null) return NotFound();

        card.PageSlug = request.PageSlug;
        card.IconKey = request.IconKey;
        card.Title = request.Title;
        card.Body = request.Body;
        card.SortOrder = request.SortOrder;
        card.IsActive = request.IsActive;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var card = await _db.FeatureCards.FindAsync(id);
        if (card is null) return NotFound();

        _db.FeatureCards.Remove(card);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static FeatureCardResponse ToResponse(FeatureCard c) =>
        new(c.Id, c.PageSlug, c.IconKey, c.Title, c.Body, c.SortOrder, c.IsActive);
}
