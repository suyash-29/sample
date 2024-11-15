using AmazeCareAPI.Data;
using AmazeCareAPI.Models;
using AmazeCareAPI.Dtos;
using Microsoft.EntityFrameworkCore;

namespace AmazeCareAPI.Repositories
{
    public class PatientRepository : IPatientRepository
    {
        private readonly AmazeCareContext _context;

        public PatientRepository(AmazeCareContext context)
        {
            _context = context;
        }

        public async Task<Patient?> GetPatientByUserIdAsync(int userId)
        {
            return await _context.Patients.FirstOrDefaultAsync(p => p.UserID == userId);
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }
        public async Task UpdatePatientAsync(Patient patient)
        {
            _context.Patients.Update(patient);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> IsDoctorOnHoliday(int doctorId, DateTime appointmentDate)
        {
            return await _context.DoctorHolidays.AnyAsync(h =>
                h.DoctorID == doctorId && h.Status == "Scheduled" &&
                appointmentDate >= h.StartDate && appointmentDate <= h.EndDate);
        }

        public async Task AddAppointmentAsync(Appointment appointment)
        {
            await _context.Appointments.AddAsync(appointment);
        }

        public async Task<IEnumerable<DoctorDto>> SearchDoctorsAsync(string? specialization)
        {
            var query = _context.Doctors.AsQueryable();

            query = query.Where(d => d.Designation != "Inactive");

            if (!string.IsNullOrEmpty(specialization))
            {
                query = query
                    .Where(d => d.DoctorSpecializations
                        .Any(ds => ds.Specialization.SpecializationName == specialization));
            }

            return await query.Select(d => new DoctorDto
            {
                FullName = d.FullName,
                ExperienceYears = d.ExperienceYears,
                Qualification = d.Qualification,
                Designation = d.Designation,
                Specializations = d.DoctorSpecializations
                    .Select(ds => ds.Specialization.SpecializationName)
                    .ToList(),
                Holidays = d.DoctorHolidays
                    .Where(h => h.Status == "Scheduled")
                    .Select(h => new HolidayDto
                    {
                        StartDate = h.StartDate,
                        EndDate = h.EndDate
                    }).ToList()
            }).ToListAsync();
        }



        public async Task<Appointment?> GetAppointmentByIdAsync(int appointmentId)
        {
            return await _context.Appointments.FindAsync(appointmentId);
        }
        public async Task<Appointment?> GetAppointmentByIdAsync(int patientId, int appointmentId)
        {
            return await _context.Appointments
                .FirstOrDefaultAsync(a => a.PatientID == patientId && a.AppointmentID == appointmentId);
        }
        public async Task UpdateAppointmentAsync(Appointment appointment)
        {
            _context.Appointments.Update(appointment);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Appointment>> GetAppointmentsByPatientIdAsync(int patientId)
        {
            return await _context.Appointments
                .Where(a => a.PatientID == patientId)
                .ToListAsync();
        }

        public async Task<List<PatientMedicalRecordDto>> GetMedicalHistoryAsync(int patientId)
        {
            return await _context.Appointments
                .Where(a => a.PatientID == patientId)
                .Include(a => a.Doctor)
                .Include(a => a.MedicalRecord)
                    .ThenInclude(m => m.MedicalRecordTests)
                        .ThenInclude(mt => mt.Test)
                .Include(a => a.MedicalRecord)
                    .ThenInclude(m => m.Prescriptions)
                .Select(a => new PatientMedicalRecordDto
                {
                    AppointmentDate = a.AppointmentDate,
                    DoctorName = a.Doctor.FullName,
                    Symptoms = a.MedicalRecord.Symptoms,
                    PhysicalExamination = a.MedicalRecord.PhysicalExamination,
                    TreatmentPlan = a.MedicalRecord.TreatmentPlan,
                    FollowUpDate = a.MedicalRecord.FollowUpDate,
                    Tests = a.MedicalRecord.MedicalRecordTests.Select(mt => new TestDto
                    {
                        TestName = mt.Test.TestName,
                        TestPrice = mt.Test.TestPrice
                    }).ToList(),
                    Prescriptions = a.MedicalRecord.Prescriptions.Select(p => new PrescriptionDto
                    {
                        MedicationName = p.MedicationName,
                        Dosage = p.Dosage,
                        DurationDays = p.DurationDays,
                        Quantity = p.Quantity
                    }).ToList(),
                    BillingDetails = _context.Billing
                        .Where(b => b.PatientID == patientId && b.MedicalRecordID == a.MedicalRecord.RecordID)
                        .Select(b => new BillingDto
                        {
                            ConsultationFee = b.ConsultationFee,
                            TotalTestsPrice = b.TotalTestsPrice,
                            TotalMedicationsPrice = b.TotalMedicationsPrice,
                            GrandTotal = b.GrandTotal,
                            Status = b.Status
                        }).FirstOrDefault()
                }).ToListAsync();
        }

        public async Task<int> GetPatientIdByUserIdAsync(int userId)
        {
            return await _context.Patients
                .Where(p => p.UserID == userId)
                .Select(p => p.PatientID)
                .FirstOrDefaultAsync();
        }

        public async Task<List<PatientTestDetailDto>> GetTestDetailsByPatientIdAsync(int patientId)
        {
            return await _context.Appointments
                .Where(a => a.PatientID == patientId)
                .Include(a => a.Doctor)
                .Include(a => a.MedicalRecord)
                    .ThenInclude(m => m.MedicalRecordTests)
                        .ThenInclude(mt => mt.Test)
                .SelectMany(a => a.MedicalRecord.MedicalRecordTests.Select(mt => new PatientTestDetailDto
                {
                    AppointmentId = a.AppointmentID,
                    DoctorName = a.Doctor.FullName,
                    TestId = mt.Test.TestID,
                    TestName = mt.Test.TestName,
                    TestPrice = mt.Test.TestPrice
                }))
                .ToListAsync();
        }

        public async Task<List<PatientPrescriptionDetailDto>> GetPrescriptionDetailsByPatientIdAsync(int patientId)
        {
            return await _context.Appointments
                .Where(a => a.PatientID == patientId)
                .Include(a => a.Doctor)
                .Include(a => a.MedicalRecord)
                    .ThenInclude(m => m.Prescriptions)
                .SelectMany(a => a.MedicalRecord.Prescriptions.Select(p => new PatientPrescriptionDetailDto
                {
                    AppointmentId = a.AppointmentID,
                    DoctorName = a.Doctor.FullName ?? "N/A",          
                    MedicationName = p.MedicationName ?? string.Empty,   
                    Dosage = p.Dosage ?? string.Empty,                  
                    DurationDays = p.DurationDays, 
                    Quantity = p.Quantity
                }))
                .ToListAsync();
        }

        public async Task<List<BillingDto>> GetBillingDetailsByPatientIdAsync(int patientId)
        {
            return await _context.Billing
                .Where(b => b.PatientID == patientId)
                .Select(b => new BillingDto
                {
                    BillingID = b.BillingID,
                    ConsultationFee = b.ConsultationFee,
                    TotalTestsPrice = b.TotalTestsPrice,
                    TotalMedicationsPrice = b.TotalMedicationsPrice,
                    GrandTotal = b.GrandTotal,
                    Status = b.Status
                })
                .ToListAsync();
        }

        public async Task<Appointment?> GetAppointmentByIdAndPatientIdAsync(int appointmentId, int patientId)
        {
            return await _context.Appointments
                .FirstOrDefaultAsync(a => a.AppointmentID == appointmentId && a.PatientID == patientId);
        }

        public async Task<bool> IsDoctorHolidayAsync(int doctorId, DateTime newAppointmentDate)
        {
            return await _context.DoctorHolidays
                .AnyAsync(h => h.DoctorID == doctorId
                               && h.Status == "Scheduled"
                               && newAppointmentDate >= h.StartDate
                               && newAppointmentDate <= h.EndDate);
        }


       
    }
}
