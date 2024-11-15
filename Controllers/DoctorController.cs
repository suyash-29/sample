using AmazeCareAPI.Data;
using AmazeCareAPI.Dtos;
using AmazeCareAPI.Models;
using AmazeCareAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;


[Authorize(Roles = "Doctor")]
[Route("api/[controller]")]
[ApiController]
public class DoctorController : ControllerBase
{
    private readonly DoctorService _doctorService;
    private readonly AmazeCareContext _context;

    public DoctorController(DoctorService doctorService , AmazeCareContext context)
    {
        _doctorService = doctorService;
        _context = context;  // Initialize _context
        
    }

    [HttpGet("GetAppointmentsByStatus")]
    public async Task<IActionResult> GetAppointmentsByStatus([FromQuery] string status)
    {
        var doctorId = await GetDoctorIdFromTokenAsync();
        if (doctorId == null)
            return Unauthorized("Doctor ID not found for the authenticated user.");

        if (string.IsNullOrWhiteSpace(status) || !new[] { "Completed", "Scheduled", "Canceled" }.Contains(status))
            return BadRequest("Invalid status. Valid values are 'Completed', 'Scheduled', or 'Canceled'.");

        var appointments = await _doctorService.GetAppointmentsByStatus(doctorId.Value, status);
        if (appointments == null || !appointments.Any())
            return NotFound("No appointments found with the specified status.");

        return Ok(appointments);
    }

    [HttpPut("CancelAppointments/{appointmentId}/cancel")]
    public async Task<IActionResult> CancelScheduledAppointment(int appointmentId)
    {
        var doctorId = await GetDoctorIdFromTokenAsync();
        if (doctorId == null)
            return Unauthorized("Doctor ID not found for the authenticated user.");

        var success = await _doctorService.CancelScheduledAppointment(doctorId.Value, appointmentId);
        if (!success)
            return NotFound("Appointment not found or it is not scheduled.");

        return Ok("Appointment canceled successfully.");
    }


    // Use Case: Conduct Consultation (Fill Medical Record)
    [HttpPost("appointments/{appointmentId}/consult")]
    public async Task<IActionResult> ConductConsultation(
     int appointmentId,
     [FromBody] CreateMedicalRecordDto recordDto,
     [FromQuery] decimal consultationFee)
    {
        var doctorId = await GetDoctorIdFromTokenAsync();
        if (doctorId == null)
            return Unauthorized("Doctor ID not found for the authenticated user.");

        var success = await _doctorService.ConductConsultation(doctorId.Value, appointmentId, recordDto, consultationFee);

        if (!success)
            return BadRequest("Failed to conduct consultation.");

        return Ok("Consultation completed successfully.");
    }


    // Get medical records 
    [HttpGet("GetPatientMedicalRecords/{patientId}/medical-records")]
    public async Task<IActionResult> GetPatientMedicalRecords(int patientId)
    {
        var doctorId = await GetDoctorIdFromTokenAsync();
        if (doctorId == null)
            return Unauthorized("Doctor ID not found for the authenticated user.");

        var records = await _doctorService.GetMedicalRecordsByPatientIdAsync(patientId);
        return Ok(records);
    }


    // Use Case: Update Medical Record
    [HttpPut("UpdateMedicalRecord/{recordId}/{patientId}")]
    public async Task<IActionResult> UpdateMedicalRecord(int recordId, int patientId, [FromBody] UpdateMedicalRecordDto recordDto)
    {
        var doctorId = await GetDoctorIdFromTokenAsync();
        if (doctorId == null)
            return Unauthorized("Doctor ID not found for the authenticated user.");

        var success = await _doctorService.UpdateMedicalRecord(doctorId.Value, recordId, patientId, recordDto);
        if (!success)
            return NotFound("Medical record not found or unauthorized access.");

        return Ok("Medical record updated successfully.");
    }

    // Endpoint to mark a billing record as paid
    [HttpPut("billing/{billingId}/pay")]
    public async Task<IActionResult> UpdateBillingStatus(int billingId)
    {
        var doctorId = await GetDoctorIdFromTokenAsync();
        if (doctorId == null)
            return Unauthorized("Doctor ID not found for the authenticated user.");

        var success = await _doctorService.UpdateBillingStatus(billingId, doctorId.Value);
        if (!success)
            return BadRequest("Billing record not found or already marked as 'Paid'.");

        return Ok("Billing status updated to 'Paid'.");
    }

    [HttpGet("GetAllMedications")]
    public async Task<ActionResult<IEnumerable<MedicationDto>>> GetMedications()
    {
        var medications = await _doctorService.GetMedicationsAsync();
        return Ok(medications);
    }
    [HttpGet("GetAllTests")]
    public async Task<ActionResult<IEnumerable<TestDto>>> GetTests()
    {
        var tests = await _doctorService.GetTestsAsync();
        return Ok(tests);
    }

    [HttpPost("CreateHolidays")]
    public async Task<IActionResult> AddHoliday([FromBody] CreateHolidayDto holidayDto)
    {
        var doctorId = await GetDoctorIdFromTokenAsync();
        if (doctorId == null)
            return Unauthorized("Doctor ID not found for the authenticated user.");

        bool success = await _doctorService.AddHoliday(doctorId.Value, holidayDto);
        if (!success)
            return BadRequest("Failed to add holiday.");

        return Ok("Holiday added successfully.");
    }

    [HttpPut("Updateholidays/{holidayId}")]
    public async Task<IActionResult> UpdateHoliday(int holidayId, [FromBody] UpdateHolidayDto updateDto)
    {
        var doctorId = await GetDoctorIdFromTokenAsync();
        if (doctorId == null)
            return Unauthorized("Doctor ID not found for the authenticated user.");

        bool success = await _doctorService.UpdateHoliday(holidayId, doctorId.Value, updateDto);
        if (!success)
            return NotFound("Holiday not found or unauthorized access.");

        return Ok("Holiday updated successfully.");
    }

    [HttpGet("GetALlHolidays")]
    public async Task<IActionResult> GetHolidays()
    {
        var doctorId = await GetDoctorIdFromTokenAsync();
        if (doctorId == null)
            return Unauthorized("Doctor ID not found for the authenticated user.");

        var holidays = await _doctorService.GetHolidays(doctorId.Value);
        if (!holidays.Any())
            return NotFound("No holidays found.");

        return Ok(holidays);
    }

    [HttpPut("CancelHolidays/{holidayId}")]
    public async Task<IActionResult> CancelHoliday(int holidayId)
    {
        var doctorId = await GetDoctorIdFromTokenAsync();
        if (doctorId == null)
            return Unauthorized("Doctor ID not found for the authenticated user.");

        bool success = await _doctorService.CancelHoliday(holidayId, doctorId.Value);
        if (!success)
            return NotFound("Holiday not found, unauthorized access, or already completed.");

        return Ok("Holiday cancelled successfully.");
    }


    [HttpPut("RescheduleAppointment/{appointmentId}")]
    public async Task<IActionResult> RescheduleAppointment(int appointmentId, [FromBody] AppointmentRescheduleDto rescheduleDto)
    {
        var doctorId = await GetDoctorIdFromTokenAsync();
        if (doctorId == null)
            return Unauthorized("Doctor ID not found for the authenticated user.");

        var (success, message) = await _doctorService.RescheduleAppointment(doctorId.Value, appointmentId, rescheduleDto);

        if (!success)
            return BadRequest(message); // Return the error message if rescheduling fails

        return Ok("Appointment rescheduled successfully.");
    }

    private async Task<int?> GetDoctorIdFromTokenAsync()
    {
        // Extract the UserID from the token
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token.");
        }

        // Query the Doctors table to get the DoctorID
        var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserID == userId);
        return doctor?.DoctorID;
    }

}

