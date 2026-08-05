namespace AdvanceLab.Api.Models;

public class Testimonial
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? RoleOrLocation { get; set; }
    public string Quote { get; set; } = string.Empty;
    public int Rating { get; set; } = 5;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
