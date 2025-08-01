using System.Text;

namespace Shorten.Services;

public interface IUrlShortenerService
{
    string GenerateShortCode(int length = 7);
    bool IsValidUrl(string url);
    string EnsureUrlHasScheme(string url);
}

public class UrlShortenerService : IUrlShortenerService
{
    private const string Characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private readonly Random _random = new();

    public string GenerateShortCode(int length = 7)
    {
        var result = new StringBuilder(length);
        for (int i = 0; i < length; i++)
        {
            result.Append(Characters[_random.Next(Characters.Length)]);
        }
        return result.ToString();
    }

    public bool IsValidUrl(string url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return false;

        // Ensure URL has a scheme
        url = EnsureUrlHasScheme(url);

        return Uri.TryCreate(url, UriKind.Absolute, out Uri? uriResult)
            && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }

    public string EnsureUrlHasScheme(string url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return url;

        if (!url.StartsWith("http://") && !url.StartsWith("https://"))
        {
            return "https://" + url;
        }

        return url;
    }
}
