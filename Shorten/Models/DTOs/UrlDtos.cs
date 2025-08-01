using System.ComponentModel.DataAnnotations;

namespace Shorten.Models.DTOs;

public class CreateUrlDto
{
    [Required]
    [Url(ErrorMessage = "Please provide a valid URL")]
    public string OriginalUrl { get; set; } = string.Empty;
    
    public string? CustomCode { get; set; }
    
    public DateTime? ExpiresAt { get; set; }
}

public class UrlResponseDto
{
    public int Id { get; set; }
    public string OriginalUrl { get; set; } = string.Empty;
    public string ShortCode { get; set; } = string.Empty;
    public string ShortUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int ClickCount { get; set; }
    public DateTime? LastAccessedAt { get; set; }
    public bool IsActive { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class UrlStatsDto
{
    public int Id { get; set; }
    public string OriginalUrl { get; set; } = string.Empty;
    public string ShortCode { get; set; } = string.Empty;
    public string ShortUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int ClickCount { get; set; }
    public DateTime? LastAccessedAt { get; set; }
    public bool IsActive { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class BulkUrlsResponseDto
{
    public List<UrlResponseDto> Urls { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}
