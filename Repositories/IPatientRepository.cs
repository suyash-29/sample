using AmazeCareAPI.Models;
using AmazeCareAPI.Dtos;

namespace AmazeCareAPI.Repositories
{
    public interface IPatientRepository
    {
        Task<Patient?> GetPatientByUserIdAsync(int userId);
        Task UpdatePatientAsync(Patient patient);
        Task<IEnumerable<DoctorDto>> SearchDoctorsAsync(string? specialization);
        Task AddAppointmentAsync(Appointment appointment);
        Task<Appointment?> GetAppointmentByIdAsync(int appointmentId);
        Task UpdateAppointmentAsync(Appointment appointment);
        Task<IEnumerable<Appointment>> GetAppointmentsByPatientIdAsync(int patientId);
        Task<List<PatientMedicalRecordDto>> GetMedicalHistoryAsync(int patientId);
       

        Task<bool> IsDoctorOnHoliday(int doctorId, DateTime appointmentDate);

        Task<Appointment?> GetAppointmentByIdAsync(int patientId, int appointmentId);
        Task<int> SaveChangesAsync();


        Task<int> GetPatientIdByUserIdAsync(int userId);
        Task<List<PatientTestDetailDto>> GetTestDetailsByPatientIdAsync(int patientId);
        Task<List<PatientPrescriptionDetailDto>> GetPrescriptionDetailsByPatientIdAsync(int patientId);
        Task<List<BillingDto>> GetBillingDetailsByPatientIdAsync(int patientId);
        Task<Appointment?> GetAppointmentByIdAndPatientIdAsync(int appointmentId, int patientId);
        Task<bool> IsDoctorHolidayAsync(int doctorId, DateTime newAppointmentDate);

    }
}
