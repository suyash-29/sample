    using System;
    using System.IdentityModel.Tokens.Jwt;
    using System.Security.Claims;
    using System.Text;
    using AmazeCareAPI.Data;
    using Microsoft.AspNetCore.Http;
    using Microsoft.Extensions.Configuration;
    using Microsoft.IdentityModel.Tokens;
    using Microsoft.EntityFrameworkCore;
    using System.Threading.Tasks;

    namespace AmazeCareAPI.Middleware
    {
        public class AutoTokenMiddleware
        {
            private readonly RequestDelegate _next;
            private readonly IConfiguration _configuration;

            public AutoTokenMiddleware(RequestDelegate next, IConfiguration configuration)
            {
                _next = next;
                _configuration = configuration;
            }

            public async Task InvokeAsync(HttpContext context)
            {
                var dbContext = context.RequestServices.GetRequiredService<AmazeCareContext>();
                var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

                if (string.IsNullOrEmpty(token) || !IsValidJwtToken(token))
                {
                    // Set default user ID, or obtain based on context
                    int userId = 1; // Example userId; replace with actual user lookup logic if needed
                    var user = await dbContext.Users.FindAsync(userId);

                    if (user != null)
                    {
                        // Generate a new token if missing or invalid
                        var newToken = await GenerateJwtTokenAsync(dbContext, user.UserID, user.RoleID);
                        context.Request.Headers["Authorization"] = $"Bearer {newToken}";
                    }
                }

                await _next(context);
            }

            private bool IsValidJwtToken(string token)
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                try
                {
                    var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]);
                    tokenHandler.ValidateToken(token, new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(key),
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidIssuer = _configuration["Jwt:Issuer"],
                        ValidAudience = _configuration["Jwt:Audience"],
                        ClockSkew = TimeSpan.Zero
                    }, out SecurityToken validatedToken);

                    return validatedToken != null;
                }
                catch
                {
                    return false;
                }
            }

            private async Task<string> GenerateJwtTokenAsync(AmazeCareContext dbContext, int userId, int roleId)
            {
                // Fetch role name dynamically
                var role = await dbContext.UserRoles
                    .Where(r => r.RoleID == roleId)
                    .Select(r => r.RoleName)
                    .FirstOrDefaultAsync();

                if (role == null)
                {
                    throw new UnauthorizedAccessException("Invalid role ID");
                }

                var claims = new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                    new Claim(ClaimTypes.Role, role)
                };

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var token = new JwtSecurityToken(
                    issuer: _configuration["Jwt:Issuer"],
                    audience: _configuration["Jwt:Audience"],
                    claims: claims,
                    expires: DateTime.UtcNow.AddHours(1),
                    signingCredentials: creds);

                return new JwtSecurityTokenHandler().WriteToken(token);
            }
        }
    }
