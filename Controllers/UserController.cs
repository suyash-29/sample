using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using AmazeCareAPI.Models;
using AmazeCareAPI.Services;
using AmazeCareAPI.Dtos;

namespace AmazeCareAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;

        public UserController(UserService userService)
        {
            _userService = userService;
        }

        [HttpGet("check-username")]
        public async Task<IActionResult> CheckUsernameAvailability([FromQuery] string username)
        {
            var (isAvailable, message) = await _userService.CheckUsernameAvailabilityAsync(username);
            return Ok(new { Username = username, IsAvailable = isAvailable, Message = message });
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterPatient([FromBody] PatientRegistrationDto registrationDto)
        {
            if (!ModelState.IsValid)
                return BadRequest("Invalid registration details provided.");

            // Check if username is available
            var (isAvailable, message) = await _userService.CheckUsernameAvailabilityAsync(registrationDto.Username);
            if (!isAvailable)
                return BadRequest(message);  // Abort registration if username is taken

            // Proceed with registration if username is available
            var user = new User
            {
                Username = registrationDto.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(registrationDto.Password),
                RoleID = 1 // Patient RoleID
            };

            try
            {
                var patient = await _userService.RegisterPatient(user, registrationDto.FullName, registrationDto.Email,
                    registrationDto.DateOfBirth, registrationDto.Gender, registrationDto.ContactNumber,
                    registrationDto.Address, registrationDto.MedicalHistory);

                return CreatedAtAction(nameof(RegisterPatient), new { id = patient.PatientID }, patient);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }

        }
    }
}
