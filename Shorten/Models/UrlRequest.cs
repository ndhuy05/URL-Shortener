namespace Shorten.Models;

// Class đơn giản thay thế DTO
public class UrlRequest
{
    public string OriginalUrl { get; set; } = string.Empty;
    public string? CustomCode { get; set; }
}
