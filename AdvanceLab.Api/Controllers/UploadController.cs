using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdvanceLab.Api.Controllers;

[ApiController]
[Route("api/upload")]
[Authorize]
public class UploadController : ControllerBase
{
    private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".jfif", ".pjpeg", ".pjp", ".png", ".webp", ".gif", ".bmp", ".svg" };
    private readonly IWebHostEnvironment _env;

    public UploadController(IWebHostEnvironment env)
    {
        _env = env;
    }

    [HttpPost("image")]
    [RequestSizeLimit(10_000_000)] // 10 MB
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file.Length == 0) return BadRequest(new { message = "No file provided." });

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            return BadRequest(new { message = "Only image files (jpg, jfif, png, webp, gif, bmp, svg) are allowed." });
        }

        var uploadsRoot = Path.Combine(_env.WebRootPath, "uploads");
        Directory.CreateDirectory(uploadsRoot);

        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsRoot, fileName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return Ok(new { url = $"/uploads/{fileName}" });
    }
}
