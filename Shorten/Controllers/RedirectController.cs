using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shorten.Data;

namespace Shorten.Controllers;

[ApiController]
[Route("")]
public class RedirectController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RedirectController(ApplicationDbContext context)
    {
        _context = context;
    }

    // API đơn giản để redirect đến URL gốc
    [HttpGet("{shortCode}")]
    public async Task<IActionResult> RedirectToOriginal(string shortCode)
    {
        // Tìm URL trong database
        var shortenedUrl = await _context.ShortenedUrls
            .FirstOrDefaultAsync(u => u.ShortCode == shortCode);

        if (shortenedUrl == null)
            return NotFound("URL không tồn tại");

        // Tăng số lượt click
        shortenedUrl.ClickCount++;
        await _context.SaveChangesAsync();

        // Redirect đến URL gốc
        return Redirect(shortenedUrl.OriginalUrl);
    }
}
