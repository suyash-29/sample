﻿using AmazeCareAPI.Dtos;
using AmazeCareAPI.Models;

namespace AmazeCareAPI.Services.Interface
{
    public interface IPatientService
    {
        Task<Patient?> UpdatePersonalInfoAsync(int userId, PatientUpdateDto updateDto);

        Task<(Appointment appointment, string message)> ScheduleAppointment(int userId, AppointmentBookingDto bookingDto);
        Task<List<PatientMedicalRecordDto>> GetMedicalHistory(int userId);
        Task<IEnumerable<DoctorDto>> SearchDoctors(string specialization = null);

        Task<IEnumerable<Appointment>> GetAppointments(int userId);
        Task<bool> CancelAppointment(int userId, int appointmentId);

        Task<List<PatientTestDetailDto>> GetTestDetails(int userId);
        Task<List<PatientPrescriptionDetailDto>> GetPrescriptionDetails(int userId);
        Task<List<BillingDto>> GetBillingDetails(int userId);
        Task<(Appointment? appointment, string message)> RescheduleAppointment(int userId, int appointmentId, AppointmentRescheduleDto rescheduleDto);

    }
}
