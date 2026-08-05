namespace AdvanceLab.Api.DTOs;

public record ServiceCategoryResponse(int Id, string Name, string Slug, string? Description, int SortOrder, List<ServiceItemResponse> Items);
public record ServiceItemResponse(int Id, string Name, string? Description, decimal Price, bool IsActive, int? DiscountPercent, string? OfferBadgeText);

public record UpsertServiceCategoryRequest(string Name, string Slug, string? Description, int SortOrder);
public record UpsertServiceItemRequest(int ServiceCategoryId, string Name, string? Description, decimal Price, int SortOrder, bool IsActive, int? DiscountPercent, string? OfferBadgeText);

public record ContentBlockResponse(int Id, string PageSlug, string Key, string? Title, string? Body, string? ImageUrl, int SortOrder);
public record UpsertContentBlockRequest(string PageSlug, string Key, string? Title, string? Body, string? ImageUrl, int SortOrder);

public record SiteImageResponse(int Id, string Section, string Url, string? AltText, int SortOrder, bool IsActive);
public record UpsertSiteImageRequest(string Section, string Url, string? AltText, int SortOrder, bool IsActive);

public record TestimonialResponse(int Id, string CustomerName, string? RoleOrLocation, string Quote, int Rating, int SortOrder, bool IsActive);
public record UpsertTestimonialRequest(string CustomerName, string? RoleOrLocation, string Quote, int Rating, int SortOrder, bool IsActive);

public record FeatureCardResponse(int Id, string PageSlug, string IconKey, string Title, string? Body, int SortOrder, bool IsActive);
public record UpsertFeatureCardRequest(string PageSlug, string IconKey, string Title, string? Body, int SortOrder, bool IsActive);

public record CreateContactMessageRequest(string Name, string? Email, string? Phone, string Message);
public record ContactMessageResponse(int Id, string Name, string? Email, string? Phone, string Message, bool IsRead, DateTime CreatedAt);

public record CreateCallbackRequestRequest(string? Name, string PhoneNo);
public record CallbackRequestResponse(int Id, string? Name, string PhoneNo, bool IsContacted, DateTime CreatedAt);
