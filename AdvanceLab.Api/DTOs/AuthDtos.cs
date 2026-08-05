namespace AdvanceLab.Api.DTOs;

public record LoginRequest(string Username, string Password);
public record LoginResponse(string Token, string Username, string Role, string? AvatarUrl, DateTime ExpiresAt);

public record ForgotPasswordRequest(string Email);
public record ResetPasswordRequest(string Token, string NewPassword);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

public record AdminProfileResponse(string Username, string Email, string Role, string? AvatarUrl);
public record UpdateProfileRequest(string Username, string Email, string? AvatarUrl);
