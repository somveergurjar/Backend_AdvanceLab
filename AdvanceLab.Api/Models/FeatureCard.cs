namespace AdvanceLab.Api.Models;

// Icon + title + body cards used by "Why Choose Us" style sections,
// scoped per page (e.g. "home", "about-us") so each page can have its own set.
public class FeatureCard
{
    public int Id { get; set; }
    public string PageSlug { get; set; } = string.Empty;
    public string IconKey { get; set; } = "flask";
    public string Title { get; set; } = string.Empty;
    public string? Body { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}
