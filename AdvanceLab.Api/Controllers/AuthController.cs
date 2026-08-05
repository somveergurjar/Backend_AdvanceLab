using System.Security.Claims;
using System.Security.Cryptography;
using AdvanceLab.Api.Data;
using AdvanceLab.Api.DTOs;
using AdvanceLab.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AdvanceLab.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TokenService _tokenService;
    private readonly EmailService _emailService;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext db, TokenService tokenService, EmailService emailService, IConfiguration config)
    {
        _db = db;
        _tokenService = tokenService;
        _emailService = emailService;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var user = await _db.AdminUsers.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid username or password." });
        }

        user.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var (token, expiresAt) = _tokenService.CreateToken(user);
        return Ok(new LoginResponse(token, user.Username, user.Role, user.AvatarUrl, expiresAt));
    }

    // Always returns the same generic response whether or not the email matches an
    // account, so this endpoint can't be used to discover which emails are registered.
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request)
    {
        var user = await _db.AdminUsers.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user is not null)
        {
            user.ResetToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
            user.ResetTokenExpiresAt = DateTime.UtcNow.AddHours(1);
            await _db.SaveChangesAsync();

            var frontendUrl = _config["Frontend:BaseUrl"] ?? "http://localhost:5173";
            var resetLink = $"{frontendUrl}/admin/reset-password?token={user.ResetToken}";

            await _emailService.SendAsync(
                user.Email,
                "Reset your Advance Diagnostic Lab admin password",
                $"Click the link below to reset your password. This link expires in 1 hour.\n\n{resetLink}\n\nIf you didn't request this, you can ignore this email.");
        }

        return Ok(new { message = "If that email is registered, a reset link has been sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
    {
        if (request.NewPassword.Length < 6)
        {
            return BadRequest(new { message = "Password must be at least 6 characters." });
        }

        var user = await _db.AdminUsers.FirstOrDefaultAsync(u => u.ResetToken == request.Token);
        if (user is null || user.ResetTokenExpiresAt is null || user.ResetTokenExpiresAt < DateTime.UtcNow)
        {
            return BadRequest(new { message = "This reset link is invalid or has expired." });
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.ResetToken = null;
        user.ResetTokenExpiresAt = null;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Password updated. You can now log in with your new password." });
    }

    // Authenticated: lets an already-logged-in admin change their own password,
    // separate from the token-based reset flow used for a forgotten password.
    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        if (request.NewPassword.Length < 6)
        {
            return BadRequest(new { message = "Password must be at least 6 characters." });
        }

        var userId = int.Parse(User.FindFirstValue("uid")!);
        var user = await _db.AdminUsers.FindAsync(userId);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(new { message = "Current password is incorrect." });
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Password changed successfully." });
    }

    // Authenticated: the current admin's own profile (username/email), shown on the profile page.
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<AdminProfileResponse>> GetProfile()
    {
        var userId = int.Parse(User.FindFirstValue("uid")!);
        var user = await _db.AdminUsers.FindAsync(userId);
        if (user is null) return NotFound();

        return Ok(new AdminProfileResponse(user.Username, user.Email, user.Role, user.AvatarUrl));
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<ActionResult<AdminProfileResponse>> UpdateProfile(UpdateProfileRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { message = "Username and email are required." });
        }

        var userId = int.Parse(User.FindFirstValue("uid")!);
        var user = await _db.AdminUsers.FindAsync(userId);
        if (user is null) return NotFound();

        var usernameTaken = await _db.AdminUsers.AnyAsync(u => u.Id != userId && u.Username == request.Username);
        if (usernameTaken)
        {
            return BadRequest(new { message = "That username is already taken." });
        }

        user.Username = request.Username.Trim();
        user.Email = request.Email.Trim();
        user.AvatarUrl = request.AvatarUrl;
        await _db.SaveChangesAsync();

        return Ok(new AdminProfileResponse(user.Username, user.Email, user.Role, user.AvatarUrl));
    }
}
