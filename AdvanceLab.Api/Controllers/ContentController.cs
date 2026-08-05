using AdvanceLab.Api.Data;
using AdvanceLab.Api.DTOs;
using AdvanceLab.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AdvanceLab.Api.Controllers;

[ApiController]
[Route("api/content")]
public class ContentController : ControllerBase
{
    private readonly AppDbContext _db;

    public ContentController(AppDbContext db)
    {
        _db = db;
    }

    // Public: fetch all editable text/image blocks for a given page (e.g. "home", "about-us").
    [HttpGet("blocks/{pageSlug}")]
    [AllowAnonymous]
    public async Task<ActionResult<List<ContentBlockResponse>>> GetBlocksForPage(string pageSlug)
    {
        var blocks = await _db.ContentBlocks
            .Where(b => b.PageSlug == pageSlug)
            .OrderBy(b => b.SortOrder)
            .ToListAsync();

        return Ok(blocks.Select(ToResponse).ToList());
    }

    // Admin only: list every content block across the whole site.
    [HttpGet("blocks")]
    [Authorize]
    public async Task<ActionResult<List<ContentBlockResponse>>> GetAllBlocks()
    {
        var blocks = await _db.ContentBlocks.OrderBy(b => b.PageSlug).ThenBy(b => b.SortOrder).ToListAsync();
        return Ok(blocks.Select(ToResponse).ToList());
    }

    [HttpPost("blocks")]
    [Authorize]
    public async Task<ActionResult<ContentBlockResponse>> Upsert(UpsertContentBlockRequest request)
    {
        var block = await _db.ContentBlocks
            .FirstOrDefaultAsync(b => b.PageSlug == request.PageSlug && b.Key == request.Key);

        if (block is null)
        {
            block = new ContentBlock { PageSlug = request.PageSlug, Key = request.Key };
            _db.ContentBlocks.Add(block);
        }

        block.Title = request.Title;
        block.Body = request.Body;
        block.ImageUrl = request.ImageUrl;
        block.SortOrder = request.SortOrder;
        block.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(ToResponse(block));
    }

    [HttpDelete("blocks/{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var block = await _db.ContentBlocks.FindAsync(id);
        if (block is null) return NotFound();

        _db.ContentBlocks.Remove(block);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Public: images for a given site section (e.g. "home-slider").
    [HttpGet("images/{section}")]
    [AllowAnonymous]
    public async Task<ActionResult<List<SiteImageResponse>>> GetImages(string section)
    {
        var images = await _db.SiteImages
            .Where(i => i.Section == section && i.IsActive)
            .OrderBy(i => i.SortOrder)
            .ToListAsync();

        return Ok(images.Select(i => new SiteImageResponse(i.Id, i.Section, i.Url, i.AltText, i.SortOrder, i.IsActive)).ToList());
    }

    [HttpPost("images")]
    [Authorize]
    public async Task<ActionResult<SiteImageResponse>> AddImage(UpsertSiteImageRequest request)
    {
        var image = new SiteImage
        {
            Section = request.Section,
            Url = request.Url,
            AltText = request.AltText,
            SortOrder = request.SortOrder,
            IsActive = request.IsActive
        };
        _db.SiteImages.Add(image);
        await _db.SaveChangesAsync();
        return Ok(new SiteImageResponse(image.Id, image.Section, image.Url, image.AltText, image.SortOrder, image.IsActive));
    }

    [HttpDelete("images/{id:int}")]
    [Authorize]
    public async Task<IActionResult> DeleteImage(int id)
    {
        var image = await _db.SiteImages.FindAsync(id);
        if (image is null) return NotFound();

        _db.SiteImages.Remove(image);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static ContentBlockResponse ToResponse(ContentBlock b) =>
        new(b.Id, b.PageSlug, b.Key, b.Title, b.Body, b.ImageUrl, b.SortOrder);
}
