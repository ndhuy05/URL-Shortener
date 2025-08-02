using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shorten.Data;
using Shorten.Models;
using Shorten.Services;
using System.Security.Claims;

namespace Shorten.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UrlController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IUrlShortenerService _urlShortenerService;

    public UrlController(ApplicationDbContext context, IUrlShortenerService urlShortenerService)
    {
        _context = context;
        _urlShortenerService = urlShortenerService;
    }

    // API đơn giản để rút gọn URL - không cần đăng nhập (cho sinh viên)
    [HttpPost("shorten")]
    public async Task<IActionResult> ShortenUrl([FromBody] UrlRequest request)
    {
        try
        {
            // Kiểm tra URL có hợp lệ không
            if (string.IsNullOrEmpty(request.OriginalUrl))
                return BadRequest("URL không được để trống");

            // Lấy user ID (có thể null nếu không đăng nhập)
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Tạo mã ngắn
            string shortCode;
            if (!string.IsNullOrEmpty(request.CustomCode))
            {
                // Kiểm tra mã tùy chỉnh đã tồn tại chưa
                if (await _context.ShortenedUrls.AnyAsync(u => u.ShortCode == request.CustomCode))
                    return BadRequest("Mã tùy chỉnh này đã tồn tại");
                shortCode = request.CustomCode;
            }
            else
            {
                // Tạo mã ngắn tự động
                do
                {
                    shortCode = _urlShortenerService.GenerateShortCode();
                } while (await _context.ShortenedUrls.AnyAsync(u => u.ShortCode == shortCode));
            }

            // Tạo URL rút gọn mới
            var shortenedUrl = new ShortenedUrl
            {
                OriginalUrl = request.OriginalUrl,
                ShortCode = shortCode,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.ShortenedUrls.Add(shortenedUrl);
            await _context.SaveChangesAsync();

            // Trả về kết quả
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            return Ok(new
            {
                id = shortenedUrl.Id,
                originalUrl = shortenedUrl.OriginalUrl,
                shortCode = shortenedUrl.ShortCode,
                shortUrl = $"{baseUrl}/{shortenedUrl.ShortCode}",
                createdAt = shortenedUrl.CreatedAt,
                clickCount = shortenedUrl.ClickCount
            });
        }
        catch (Exception ex)
        {
            return BadRequest($"Lỗi: {ex.Message}");
        }
    }

    // API đơn giản để lấy danh sách URL của user - không dùng DTO
    [HttpGet("my-urls")]
    [Authorize]
    public async Task<IActionResult> GetMyUrls()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
            return Unauthorized();

        var urls = await _context.ShortenedUrls
            .Where(u => u.UserId == userId)
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();

        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var response = urls.Select(u => new
        {
            id = u.Id,
            originalUrl = u.OriginalUrl,
            shortCode = u.ShortCode,
            shortUrl = $"{baseUrl}/{u.ShortCode}",
            createdAt = u.CreatedAt,
            clickCount = u.ClickCount
        }).ToList();

        return Ok(new { urls = response });
    }

    // API đơn giản để xóa URL
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteUrl(int id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
            return Unauthorized();

        var url = await _context.ShortenedUrls
            .FirstOrDefaultAsync(u => u.Id == id && u.UserId == userId);

        if (url == null)
            return NotFound("Không tìm thấy URL");

        _context.ShortenedUrls.Remove(url);
        await _context.SaveChangesAsync();

        return Ok("Xóa thành công");
    }
}
