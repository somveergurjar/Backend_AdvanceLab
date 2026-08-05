namespace AdvanceLab.Api.Models;

// Images the admin can manage: home slider, gallery, etc.
public class SiteImage
{
    public int Id { get; set; }
    public string Section { get; set; } = string.Empty; // e.g. "home-slider", "gallery"
    public string Url { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}
