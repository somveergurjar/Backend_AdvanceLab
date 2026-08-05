namespace AdvanceLab.Api.Models;

public class ServiceItem
{
    public int Id { get; set; }
    public int ServiceCategoryId { get; set; }
    public ServiceCategory? ServiceCategory { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public int? DiscountPercent { get; set; }
    public string? OfferBadgeText { get; set; }
}
