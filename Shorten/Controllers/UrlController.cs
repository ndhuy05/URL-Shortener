using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shorten.Data;
using Shorten.Models;
using Shorten.Models.DTOs;
using Shorten.Services;
using System.Security.Claims;

namespace Shorten.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UrlController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IUrlShortenerService _urlShortenerService;
    private readonly IConfiguration _configuration;

    public UrlController(
        ApplicationDbContext context,
        IUrlShortenerService urlShortenerService,
        IConfiguration configuration)
    {
        _context = context;
        _urlShortenerService = urlShortenerService;
        _configuration = configuration;
    }

    [HttpPost("shorten")]
    public async Task<IActionResult> ShortenUrl([FromBody] CreateUrlDto createUrlDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Validate URL
        if (!_urlShortenerService.IsValidUrl(createUrlDto.OriginalUrl))
            return BadRequest(new { error = "Invalid URL provided" });

        // Ensure URL has proper scheme
        var normalizedUrl = _urlShortenerService.EnsureUrlHasScheme(createUrlDto.OriginalUrl);

        // Get user ID if authenticated
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        // Generate or use custom short code
        string shortCode;
        if (!string.IsNullOrEmpty(createUrlDto.CustomCode))
        {
            // Validate custom code
            if (createUrlDto.CustomCode.Length < 3 || createUrlDto.CustomCode.Length > 10)
                return BadRequest(new { error = "Custom code must be between 3 and 10 characters" });

            if (await _context.ShortenedUrls.AnyAsync(u => u.ShortCode == createUrlDto.CustomCode))
                return BadRequest(new { error = "Custom code existed" });

            shortCode = createUrlDto.CustomCode;
        }
        else
        {
            // Generate unique short code
            do
            {
                shortCode = _urlShortenerService.GenerateShortCode();
            } while (await _context.ShortenedUrls.AnyAsync(u => u.ShortCode == shortCode));
        }

        var shortenedUrl = new ShortenedUrl
        {
            OriginalUrl = normalizedUrl,
            ShortCode = shortCode,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = createUrlDto.ExpiresAt
        };

        _context.ShortenedUrls.Add(shortenedUrl);
        await _context.SaveChangesAsync();

        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var response = new UrlResponseDto
        {
            Id = shortenedUrl.Id,
            OriginalUrl = shortenedUrl.OriginalUrl,
            ShortCode = shortenedUrl.ShortCode,
            ShortUrl = $"{baseUrl}/{shortenedUrl.ShortCode}",
            CreatedAt = shortenedUrl.CreatedAt,
            ClickCount = shortenedUrl.ClickCount,
            LastAccessedAt = shortenedUrl.LastAccessedAt,
            IsActive = shortenedUrl.IsActive,
            ExpiresAt = shortenedUrl.ExpiresAt
        };

        return Ok(response);
    }

    [HttpGet("stats/{shortCode}")]
    public async Task<IActionResult> GetUrlStats(string shortCode)
    {
        var shortenedUrl = await _context.ShortenedUrls
            .FirstOrDefaultAsync(u => u.ShortCode == shortCode);

        if (shortenedUrl == null)
            return NotFound("Short URL not found");

        // Check if user owns this URL (if authenticated)
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (shortenedUrl.UserId != null && shortenedUrl.UserId != userId)
            return Forbid("You can only view stats for your own URLs");

        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var stats = new UrlStatsDto
        {
            Id = shortenedUrl.Id,
            OriginalUrl = shortenedUrl.OriginalUrl,
            ShortCode = shortenedUrl.ShortCode,
            ShortUrl = $"{baseUrl}/{shortenedUrl.ShortCode}",
            CreatedAt = shortenedUrl.CreatedAt,
            ClickCount = shortenedUrl.ClickCount,
            LastAccessedAt = shortenedUrl.LastAccessedAt,
            IsActive = shortenedUrl.IsActive,
            ExpiresAt = shortenedUrl.ExpiresAt
        };

        return Ok(stats);
    }

    [HttpGet("my-urls")]
    [Authorize]
    public async Task<IActionResult> GetMyUrls([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
            return Unauthorized();

        var query = _context.ShortenedUrls
            .Where(u => u.UserId == userId)
            .OrderByDescending(u => u.CreatedAt);

        var totalCount = await query.CountAsync();
        var urls = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var urlDtos = urls.Select(u => new UrlResponseDto
        {
            Id = u.Id,
            OriginalUrl = u.OriginalUrl,
            ShortCode = u.ShortCode,
            ShortUrl = $"{baseUrl}/{u.ShortCode}",
            CreatedAt = u.CreatedAt,
            ClickCount = u.ClickCount,
            LastAccessedAt = u.LastAccessedAt,
            IsActive = u.IsActive,
            ExpiresAt = u.ExpiresAt
        }).ToList();

        var response = new BulkUrlsResponseDto
        {
            Urls = urlDtos,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };

        return Ok(response);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteUrl(int id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
            return Unauthorized();

        var shortenedUrl = await _context.ShortenedUrls
            .FirstOrDefaultAsync(u => u.Id == id && u.UserId == userId);

        if (shortenedUrl == null)
            return NotFound("URL not found or you don't have permission to delete it");

        _context.ShortenedUrls.Remove(shortenedUrl);
        await _context.SaveChangesAsync();

        return Ok(new { message = "URL deleted successfully" });
    }

    [HttpPut("{id}/toggle")]
    [Authorize]
    public async Task<IActionResult> ToggleUrlStatus(int id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
            return Unauthorized();

        var shortenedUrl = await _context.ShortenedUrls
            .FirstOrDefaultAsync(u => u.Id == id && u.UserId == userId);

        if (shortenedUrl == null)
            return NotFound("URL not found or you don't have permission to modify it");

        shortenedUrl.IsActive = !shortenedUrl.IsActive;
        await _context.SaveChangesAsync();

        return Ok(new { message = $"URL {(shortenedUrl.IsActive ? "activated" : "deactivated")} successfully", isActive = shortenedUrl.IsActive });
    }
}
