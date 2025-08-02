namespace Users.Models;

// Class đơn giản để thay thế DTOs cho đăng ký
public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

// Class đơn giản để thay thế DTOs cho đăng nhập
public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
