namespace AdvanceLab.Api.Models;

// Generic editable content block, keyed by page + slot, so the admin panel
// can edit any static text/image on the site without a code change.
public class ContentBlock
{
    public int Id { get; set; }
    public string PageSlug { get; set; } = string.Empty;   // e.g. "home", "about-us"
    public string Key { get; set; } = string.Empty;        // e.g. "hero-title", "intro-text"
    public string? Title { get; set; }
    public string? Body { get; set; }
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
