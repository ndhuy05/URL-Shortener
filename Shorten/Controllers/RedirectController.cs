using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shorten.Data;

namespace Shorten.Controllers;

[ApiController]
public class RedirectController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RedirectController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("{shortCode}")]
    public async Task<IActionResult> RedirectToOriginal(string shortCode)
    {
        var shortenedUrl = await _context.ShortenedUrls
            .FirstOrDefaultAsync(u => u.ShortCode == shortCode && u.IsActive);

        if (shortenedUrl == null)
            return NotFound("Short URL not found");

        // Check if expired
        if (shortenedUrl.ExpiresAt.HasValue && shortenedUrl.ExpiresAt < DateTime.UtcNow)
        {
            return BadRequest("Short URL has expired");
        }

        // Update click count and last accessed
        shortenedUrl.ClickCount++;
        shortenedUrl.LastAccessedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Redirect(shortenedUrl.OriginalUrl);
    }
}
