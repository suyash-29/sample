using Microsoft.AspNetCore.Mvc;
using AmazeCareAPI.Dtos;
using AmazeCareAPI.Services;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using System.IdentityModel.Tokens.Jwt;

namespace AmazeCareAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthenticationService _authenticationService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(AuthenticationService authenticationService, ILogger<AuthController> logger)
        {
            _authenticationService = authenticationService;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                _logger.LogWarning("Invalid login attempt with missing username or password");
                return BadRequest("Invalid client request");
            }

            // Authenticate user and generate token
            var token = await _authenticationService.AuthenticateUser(request.Username, request.Password);

            if (string.IsNullOrEmpty(token))
            {
                _logger.LogWarning($"Unauthorized login attempt for user: {request.Username}");
                return Unauthorized();
            }

            // Retrieve token expiration if needed for frontend
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadToken(token) as JwtSecurityToken;
            var expiration = jwtToken?.ValidTo;

            return Ok(new
            {
                Token = token,
                Expiration = expiration
            });
        }
    }
}
