namespace AdvanceLab.Api.Models;

public class CallbackRequest
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public string PhoneNo { get; set; } = string.Empty;
    public bool IsContacted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
