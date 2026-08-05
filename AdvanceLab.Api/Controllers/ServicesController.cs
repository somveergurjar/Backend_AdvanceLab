using AdvanceLab.Api.Data;
using AdvanceLab.Api.DTOs;
using AdvanceLab.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AdvanceLab.Api.Controllers;

[ApiController]
[Route("api/services")]
public class ServicesController : ControllerBase
{
    private readonly AppDbContext _db;

    public ServicesController(AppDbContext db)
    {
        _db = db;
    }

    // Public: categories with their items, used by the site and the booking form's profile dropdown.
    [HttpGet("categories")]
    [AllowAnonymous]
    public async Task<ActionResult<List<ServiceCategoryResponse>>> GetCategories()
    {
        var categories = await _db.ServiceCategories
            .Include(c => c.Items.Where(i => i.IsActive))
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder)
            .ToListAsync();

        return Ok(categories.Select(c => new ServiceCategoryResponse(
            c.Id, c.Name, c.Slug, c.Description, c.SortOrder,
            c.Items.OrderBy(i => i.SortOrder)
                .Select(i => new ServiceItemResponse(i.Id, i.Name, i.Description, i.Price, i.IsActive, i.DiscountPercent, i.OfferBadgeText))
                .ToList())));
    }

    // Admin only: create/update a category.
    [HttpPost("categories")]
    [Authorize]
    public async Task<ActionResult<ServiceCategoryResponse>> CreateCategory(UpsertServiceCategoryRequest request)
    {
        var category = new ServiceCategory
        {
            Name = request.Name,
            Slug = request.Slug,
            Description = request.Description,
            SortOrder = request.SortOrder
        };
        _db.ServiceCategories.Add(category);
        await _db.SaveChangesAsync();
        return Ok(new ServiceCategoryResponse(category.Id, category.Name, category.Slug, category.Description, category.SortOrder, new()));
    }

    [HttpPut("categories/{id:int}")]
    [Authorize]
    public async Task<IActionResult> UpdateCategory(int id, UpsertServiceCategoryRequest request)
    {
        var category = await _db.ServiceCategories.FindAsync(id);
        if (category is null) return NotFound();

        category.Name = request.Name;
        category.Slug = request.Slug;
        category.Description = request.Description;
        category.SortOrder = request.SortOrder;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("categories/{id:int}")]
    [Authorize]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _db.ServiceCategories.FindAsync(id);
        if (category is null) return NotFound();

        _db.ServiceCategories.Remove(category);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Admin only: create/update/delete individual test items within a category.
    [HttpPost("items")]
    [Authorize]
    public async Task<ActionResult<ServiceItemResponse>> CreateItem(UpsertServiceItemRequest request)
    {
        if (request.DiscountPercent is < 0 or > 100)
        {
            return BadRequest(new { message = "Discount percent must be between 0 and 100." });
        }

        var item = new ServiceItem
        {
            ServiceCategoryId = request.ServiceCategoryId,
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            SortOrder = request.SortOrder,
            IsActive = request.IsActive,
            DiscountPercent = request.DiscountPercent,
            OfferBadgeText = request.OfferBadgeText
        };
        _db.ServiceItems.Add(item);
        await _db.SaveChangesAsync();
        return Ok(new ServiceItemResponse(item.Id, item.Name, item.Description, item.Price, item.IsActive, item.DiscountPercent, item.OfferBadgeText));
    }

    [HttpPut("items/{id:int}")]
    [Authorize]
    public async Task<IActionResult> UpdateItem(int id, UpsertServiceItemRequest request)
    {
        if (request.DiscountPercent is < 0 or > 100)
        {
            return BadRequest(new { message = "Discount percent must be between 0 and 100." });
        }

        var item = await _db.ServiceItems.FindAsync(id);
        if (item is null) return NotFound();

        item.ServiceCategoryId = request.ServiceCategoryId;
        item.Name = request.Name;
        item.Description = request.Description;
        item.Price = request.Price;
        item.SortOrder = request.SortOrder;
        item.IsActive = request.IsActive;
        item.DiscountPercent = request.DiscountPercent;
        item.OfferBadgeText = request.OfferBadgeText;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("items/{id:int}")]
    [Authorize]
    public async Task<IActionResult> DeleteItem(int id)
    {
        var item = await _db.ServiceItems.FindAsync(id);
        if (item is null) return NotFound();

        _db.ServiceItems.Remove(item);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
