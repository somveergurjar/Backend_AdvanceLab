using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AdvanceLab.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace AdvanceLab.Api.Services;

public class TokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    public (string token, DateTime expiresAt) CreateToken(AdminUser user)
    {
        var jwtSection = _config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expiresAt = DateTime.UtcNow.AddHours(double.Parse(jwtSection["ExpiryHours"] ?? "8"));

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Username),
            // "uid" instead of ClaimTypes.NameIdentifier: the JWT bearer handler's inbound
            // claim mapping also remaps the "sub" claim to NameIdentifier, so using that type
            // here would leave two NameIdentifier claims and FindFirstValue could return
            // the username instead of the id.
            new Claim("uid", user.Id.ToString()),
            new Claim(ClaimTypes.Role, user.Role),
        };

        var token = new JwtSecurityToken(
            issuer: jwtSection["Issuer"],
            audience: jwtSection["Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}
