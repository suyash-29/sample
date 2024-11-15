using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using AmazeCareAPI.Dtos;
using System.Security.Claims;
using AmazeCareAPI.Services.Interface;

namespace AmazeCareAPI.Controllers
{
    [Authorize(Roles = "Patient")]
    [ApiController]
    [Route("api/[controller]")]
    public class PatientController : ControllerBase
    {
        private readonly IPatientService _patientService;

        public PatientController(IPatientService patientService)
        {
            _patientService = patientService;
        }

        [HttpPut("UpdatePersonalInfo")]
        public async Task<IActionResult> UpdatePersonalInfo([FromBody] PatientUpdateDto updateDto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var updatedPatient = await _patientService.UpdatePersonalInfoAsync(userId, updateDto);

            if (updatedPatient == null)
                return NotFound("Patient not found");

            return Ok(updatedPatient);
        }

        [HttpGet("SearchDoctors")]
        public async Task<IActionResult> SearchDoctors([FromQuery] string? specialization = null)
        {
            var doctors = await _patientService.SearchDoctors(specialization);

            if (doctors == null || !doctors.Any())
                return NotFound("No doctors found for the specified specialization");

            return Ok(doctors);
        }

        [HttpPost("ScheduleAppointment")]
        public async Task<IActionResult> ScheduleAppointment( AppointmentBookingDto bookingDto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var (appointment, message) = await _patientService.ScheduleAppointment(userId, bookingDto);

            if (appointment == null)
            {
                return BadRequest(message); 
            }

            return Ok(new { appointment, message }); 
        }


        [HttpPut("RescheduleAppointment/{appointmentId}")]
        public async Task<IActionResult> RescheduleAppointment(int appointmentId, [FromBody] AppointmentRescheduleDto rescheduleDto)
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized("User not authenticated.");

            var (appointment, message) = await _patientService.RescheduleAppointment(userId.Value, appointmentId, rescheduleDto);

            if (appointment == null)
                return BadRequest(message); // Return the error message if rescheduling fails

            return Ok(new { appointment, message }); // Return success message along with the appointment details
        }



        [HttpGet("GetMedicalHistory")]
        public async Task<IActionResult> GetMedicalHistory()
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized("User ID not found in token.");

            var medicalHistory = await _patientService.GetMedicalHistory(userId.Value);

            if (medicalHistory == null || !medicalHistory.Any())
                return NotFound("No medical history found.");

            return Ok(medicalHistory);
        }

        [HttpGet("GetTestDetails")]
        public async Task<IActionResult> GetTestDetails()
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized("User ID not found in token.");

            var testDetails = await _patientService.GetTestDetails(userId.Value);
            return Ok(testDetails);
        }

        [HttpGet("GetPrescriptionDetails")]
        public async Task<IActionResult> GetPrescriptionDetails()
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized("User ID not found in token.");

            var prescriptionDetails = await _patientService.GetPrescriptionDetails(userId.Value);
            return Ok(prescriptionDetails);
        }

        [HttpGet("GetBillingDetails")]
        public async Task<IActionResult> GetBillingDetails()
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
                return Unauthorized("User ID not found in token.");

            var billingDetails = await _patientService.GetBillingDetails(userId.Value);
            return Ok(billingDetails);
        }

        [HttpGet("GetAppointments")]
        public async Task<IActionResult> GetAppointments()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var appointments = await _patientService.GetAppointments(userId);

            if (appointments == null || !appointments.Any())
                return NotFound("No appointments found.");

            return Ok(appointments);
        }

        [HttpPost("CancelAppointment/{appointmentId}")]
        public async Task<IActionResult> CancelAppointment(int appointmentId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _patientService.CancelAppointment(userId, appointmentId);

            if (!result)
                return BadRequest("Unable to cancel the appointment.");

            return Ok("Appointment canceled successfully.");
        }


        private int? GetUserIdFromToken()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId) ? userId : (int?)null;
        }
    }
}
