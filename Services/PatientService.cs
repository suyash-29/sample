
using AmazeCareAPI.Data;
using AmazeCareAPI.Dtos;
using AmazeCareAPI.Models;
using AmazeCareAPI.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AmazeCareAPI.Repositories;
using AmazeCareAPI.Services.Interface;

namespace AmazeCareAPI.Services
{
    public class PatientService : IPatientService
    {
        private readonly IPatientRepository _patientRepository;

        public PatientService(IPatientRepository patientRepository)
        {
            _patientRepository = patientRepository;
        }

        public async Task<Patient?> UpdatePersonalInfoAsync(int userId, PatientUpdateDto updateDto)
        {
            var patient = await _patientRepository.GetPatientByUserIdAsync(userId);
            if (patient == null) return null;

            patient.FullName = updateDto.FullName;
            patient.ContactNumber = updateDto.ContactNumber;
            patient.Address = updateDto.Address;
            patient.MedicalHistory = updateDto.MedicalHistory;
            patient.DateOfBirth = updateDto.DateOfBirth;
            patient.Gender = updateDto.Gender;

            await _patientRepository.UpdatePatientAsync(patient);
            return patient;
        }


        public async Task<(Appointment appointment, string message)> ScheduleAppointment(int userId, AppointmentBookingDto bookingDto)
        {
            var patient = await _patientRepository.GetPatientByUserIdAsync(userId);
            if (patient == null)
                return (null, "Patient not found.");

            bool isHoliday = await _patientRepository.IsDoctorOnHoliday(bookingDto.DoctorID, bookingDto.AppointmentDate);
            if (isHoliday)
                return (null, "The selected appointment date falls within the doctor's holiday period. Please choose another date.");

            var appointment = new Appointment
            {
                PatientID = patient.PatientID,
                DoctorID = bookingDto.DoctorID,
                AppointmentDate = bookingDto.AppointmentDate,
                Symptoms = bookingDto.Symptoms,
                Status = "Scheduled"
            };

            await _patientRepository.AddAppointmentAsync(appointment);
            await _patientRepository.SaveChangesAsync();

            return (appointment, "Appointment scheduled successfully.");
        }

        public async Task<List<PatientMedicalRecordDto>> GetMedicalHistory(int userId)
        {
            var patient = await _patientRepository.GetPatientByUserIdAsync(userId);
            if (patient == null) return null;

            return await _patientRepository.GetMedicalHistoryAsync(patient.PatientID);
        }

        public async Task<IEnumerable<DoctorDto>> SearchDoctors(string specialization = null)
        {
            return await _patientRepository.SearchDoctorsAsync(specialization);
        }

        public async Task<IEnumerable<Appointment>> GetAppointments(int userId)
        {
            var patient = await _patientRepository.GetPatientByUserIdAsync(userId);
            if (patient == null) return null;

            return await _patientRepository.GetAppointmentsByPatientIdAsync(patient.PatientID);
        }

        public async Task<bool> CancelAppointment(int userId, int appointmentId)
        {
            var patient = await _patientRepository.GetPatientByUserIdAsync(userId);
            if (patient == null) return false;

            var appointment = await _patientRepository.GetAppointmentByIdAsync(patient.PatientID, appointmentId);
            if (appointment == null || appointment.Status == "Canceled") return false;

            appointment.Status = "Canceled";
            await _patientRepository.UpdateAppointmentAsync(appointment);
            await _patientRepository.SaveChangesAsync();

            return true;
        }

        public async Task<List<PatientTestDetailDto>> GetTestDetails(int userId)
        {
            var patientId = await _patientRepository.GetPatientIdByUserIdAsync(userId);
            return await _patientRepository.GetTestDetailsByPatientIdAsync(patientId);
        }

        public async Task<List<PatientPrescriptionDetailDto>> GetPrescriptionDetails(int userId)
        {
            var patientId = await _patientRepository.GetPatientIdByUserIdAsync(userId);
            return await _patientRepository.GetPrescriptionDetailsByPatientIdAsync(patientId);
        }

        public async Task<List<BillingDto>> GetBillingDetails(int userId)
        {
            var patientId = await _patientRepository.GetPatientIdByUserIdAsync(userId);
            return await _patientRepository.GetBillingDetailsByPatientIdAsync(patientId);
        }

        public async Task<(Appointment? appointment, string message)> RescheduleAppointment(int userId, int appointmentId, AppointmentRescheduleDto rescheduleDto)
        {
            var patientId = await _patientRepository.GetPatientIdByUserIdAsync(userId);
            var appointment = await _patientRepository.GetAppointmentByIdAndPatientIdAsync(appointmentId, patientId);

            if (appointment == null)
                return (null, "Appointment not found or unauthorized access.");

            var isHoliday = await _patientRepository.IsDoctorHolidayAsync(appointment.DoctorID, rescheduleDto.NewAppointmentDate);
            if (isHoliday)
                return (null, "The new appointment date conflicts with the doctor's holiday period.");

            appointment.AppointmentDate = rescheduleDto.NewAppointmentDate;
            await _patientRepository.UpdateAppointmentAsync(appointment);
            await _patientRepository.SaveChangesAsync();

            return (appointment, "Appointment rescheduled successfully.");
        }



    }
}
