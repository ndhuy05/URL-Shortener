using System.ComponentModel.DataAnnotations;

namespace Shorten.Models;

public class ShortenedUrl
{
    public int Id { get; set; }
    
    [Required]
    public string OriginalUrl { get; set; } = string.Empty;
    
    [Required]
    public string ShortCode { get; set; } = string.Empty;
    
    public string? UserId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public int ClickCount { get; set; } = 0;
    
    public DateTime? LastAccessedAt { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public DateTime? ExpiresAt { get; set; }
}
