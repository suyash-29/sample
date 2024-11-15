// Controllers/AdminController.cs
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using AmazeCareAPI.Services;
using AmazeCareAPI.Dtos;
using Microsoft.AspNetCore.Authorization;

namespace AmazeCareAPI.Controllers
{
    [Authorize(Roles = "Administrator")]
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly AdminService _adminService;

        public AdminController(AdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet("CheckUsername")]
        public async Task<IActionResult> CheckUsernameAvailability([FromQuery] string username)
        {
            var (isAvailable, message) = await _adminService.CheckUsernameAvailabilityAsync(username);
            return Ok(new { Username = username, IsAvailable = isAvailable, Message = message });
        }

        // Endpoint to register a new admin
        [HttpPost("RegisterAdmin")]
        public async Task<IActionResult> RegisterAdmin([FromBody] AdminRegistrationDto registrationDto)
        {
            try
            {
                // Register the admin using the provided data
                var admin = await _adminService.RegisterAdmin(
                    registrationDto.Username,
                    registrationDto.Password,
                    registrationDto.FullName,
                    registrationDto.Email
                );

                return CreatedAtAction(nameof(RegisterAdmin), new { id = admin.AdminID }, admin);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);  
            }
        }




        [HttpPost("RegisterDoctor")]
        public async Task<IActionResult> RegisterDoctor([FromBody] DoctorRegistrationDto doctorDto)
        {
            try
            {
                var doctor = await _adminService.RegisterDoctor(doctorDto);
                return Ok(new { message = "Doctor registered successfully.", doctor });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);  // Return error if username is taken
            }
        }

        [HttpGet("GetDoctorDetails/{doctorId}")]
        public async Task<IActionResult> GetDoctorDetails(int doctorId)
        {
            try
            {
                var doctor = await _adminService.GetDoctorDetails(doctorId);

                if (doctor == null)
                    return NotFound($"Doctor with ID {doctorId} not found.");

                return Ok(doctor);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }


        [HttpPut("UpdateDoctor/{doctorId}")]
        public async Task<IActionResult> UpdateDoctor(int doctorId, [FromBody] DoctorUpdateDto doctorDto)
        {
            var success = await _adminService.UpdateDoctorDetails(doctorId, doctorDto);
            if (!success) return NotFound(new { message = "Doctor not found." });
            return Ok(new { message = "Doctor updated successfully." });
        }


        [HttpDelete("DeleteDoctor/{userId}/{doctorId}")]
        public async Task<IActionResult> DeleteDoctor(int userId, int doctorId)
        {
            var result = await _adminService.DeleteDoctor(userId, doctorId);
            if (!result)
            {
                return NotFound(new { message = "Doctor not found or invalid user ID." });
            }
            return Ok(new { message = "Doctor deleted successfully. Associated appointments canceled." });
        }


        [HttpGet("GetPatientDetails/{patientId}")]
        public async Task<IActionResult> GetPatientDetails(int patientId)
        {
            try
            {
                var patient = await _adminService.GetPatientDetails(patientId);
                return Ok(patient);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPost("UpdatePatient")]
        public async Task<IActionResult> UpdatePatient([FromBody] PatientDto patientDto)
        {
            var patient = await _adminService.UpdatePatient(patientDto);

            if (patient == null)
                return NotFound("Patient not found");

            return Ok(patient);
        }

        [HttpDelete("DeletePatient/{userId}/{patientId}")]
        public async Task<IActionResult> DeletePatient(int userId, int patientId)
        {
            var result = await _adminService.DeletePatient(userId, patientId);
            if (!result)
            {
                return NotFound(new { message = "Patient not found or invalid user ID." });
            }
            return Ok(new { message = "Patient deleted successfully. Associated appointments canceled." });
        }


        [HttpGet("ViewAppointmentDetails/{appointmentId}")]
        public async Task<IActionResult> ViewAppointmentDetails(int appointmentId)
        {
            var appointment = await _adminService.ViewAppointmentDetails(appointmentId);

            if (appointment == null)
                return NotFound("Appointment not found");

            return Ok(appointment);
        }

        // Endpoint to update an existing holiday with doctor validation
        [HttpPut("doctor/{doctorId}/holiday/{holidayId}")]
        public async Task<IActionResult> UpdateDoctorHoliday(int doctorId, int holidayId, [FromBody] UpdateHolidayDto holidayDto)
        {
            try
            {
                await _adminService.UpdateHoliday(doctorId, holidayId, holidayDto.StartDate, holidayDto.EndDate);
                return Ok("Holiday updated successfully.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPut("doctor/{doctorId}/holiday/{holidayId}/cancel")]
        public async Task<IActionResult> CancelDoctorHoliday(int doctorId, int holidayId)
        {
            try
            {
                await _adminService.CancelHoliday(doctorId, holidayId);
                return Ok("Holiday canceled successfully.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPut("admin/reschedule-appointment/{appointmentId}")]
        public async Task<IActionResult> RescheduleAppointment(int appointmentId, [FromBody] AppointmentRescheduleDto rescheduleDto)
        {
            try
            {
                var appointment = await _adminService.RescheduleAppointment(appointmentId, rescheduleDto);

                if (appointment == null)
                    return NotFound("Appointment not found.");

                return Ok(appointment);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }



    }
}
