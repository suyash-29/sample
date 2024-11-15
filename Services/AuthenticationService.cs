using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AmazeCareAPI.Data;
using AmazeCareAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace AmazeCareAPI.Services
{
    public class AuthenticationService
    {
        private readonly AmazeCareContext _context;
        private readonly IConfiguration _configuration;

        public AuthenticationService(AmazeCareContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<string> AuthenticateUser(string username, string password)
        {
            // Retrieve the user based on username
            var user = await _context.Users
                .Include(u => u.Role) // Assuming User has a Role navigation property
                .FirstOrDefaultAsync(u => u.Username == username);

            // Verify if user exists and password is correct
            if (user == null || !VerifyPassword(password, user.PasswordHash))
            {
                return null;
            }

            // Generate JWT token
            return GenerateJwtToken(user);
        }

        private bool VerifyPassword(string password, string storedHash)
        {
            // Using BCrypt to verify password
            return BCrypt.Net.BCrypt.Verify(password, storedHash);
        }

        private string GenerateJwtToken(User user)
        {
            // Retrieve the role name
            var role = user.Role?.RoleName ?? "User"; // Fallback role name if Role is null

            // Define claims for the JWT
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserID.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, role) // Use dynamically fetched role name
            };

            // Generate the key from the configuration
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Generate the JWT token
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds);

            // Return the token string
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
