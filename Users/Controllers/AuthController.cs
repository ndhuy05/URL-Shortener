using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Users.Models;
using Users.Services;

namespace Users.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ITokenService _tokenService;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ITokenService tokenService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
    }

    // API đơn giản để đăng ký - dùng class đơn giản
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            // Kiểm tra dữ liệu đầu vào
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                return BadRequest("Email và mật khẩu không được để trống");

            // Kiểm tra user đã tồn tại chưa
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
                return BadRequest("Email này đã được sử dụng");

            // Tạo user mới
            var user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email,
                FirstName = "",
                LastName = "",
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
                return BadRequest("Không thể tạo tài khoản");

            // Tạo token
            var token = _tokenService.GenerateToken(user);

            return Ok(new
            {
                token = token,
                userId = user.Id,
                email = user.Email,
                firstName = user.FirstName,
                lastName = user.LastName
            });
        }
        catch (Exception ex)
        {
            return BadRequest($"Lỗi: {ex.Message}");
        }
    }

    // API đơn giản để đăng nhập - dùng class đơn giản
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            // Kiểm tra dữ liệu đầu vào
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                return BadRequest("Email và mật khẩu không được để trống");

            // Tìm user
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
                return BadRequest("Email hoặc mật khẩu không đúng");

            // Kiểm tra mật khẩu
            var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
            if (!result.Succeeded)
                return BadRequest("Email hoặc mật khẩu không đúng");

            // Tạo token
            var token = _tokenService.GenerateToken(user);

            return Ok(new
            {
                token = token,
                userId = user.Id,
                email = user.Email,
                firstName = user.FirstName,
                lastName = user.LastName
            });
        }
        catch (Exception ex)
        {
            return BadRequest($"Lỗi: {ex.Message}");
        }
    }
}
