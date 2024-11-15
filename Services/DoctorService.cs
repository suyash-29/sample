using AmazeCareAPI.Data;
using AmazeCareAPI.Dtos;
using AmazeCareAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace AmazeCareAPI.Services
{
    public class DoctorService
    {
        private readonly AmazeCareContext _context;

        public DoctorService(AmazeCareContext context)
        {
            _context = context;
        }



        // Method to fetch appointments based on status
        public async Task<List<AppointmentDto>> GetAppointmentsByStatus(int doctorId, string status)
        {
            var appointments = await _context.Appointments
                .Where(a => a.DoctorID == doctorId && a.Status == status)
                .Select(a => new AppointmentDto
                {
                    AppointmentID = a.AppointmentID,
                    PatientID = a.PatientID,
                    AppointmentDate = a.AppointmentDate,
                    Status = a.Status,
                    Symptoms = a.Symptoms
                })
                .ToListAsync();

            return appointments;
        }

        // Method to cancel a scheduled appointment
        public async Task<bool> CancelScheduledAppointment(int doctorId, int appointmentId)
        {
            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.AppointmentID == appointmentId && a.DoctorID == doctorId && a.Status == "Scheduled");

            if (appointment == null)
                return false;

            appointment.Status = "Canceled";
            _context.Appointments.Update(appointment);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UpdateMedicalRecord(int doctorId, int recordId, int patientId, UpdateMedicalRecordDto updateDto)
        {
            // Find the medical record by ID, doctor, and patient to ensure correct ownership
            var medicalRecord = await _context.MedicalRecords
                .FirstOrDefaultAsync(r => r.RecordID == recordId && r.DoctorID == doctorId && r.PatientID == patientId);

            if (medicalRecord == null)
                return false; // Medical record not found

            // Update fields only if they have values in updateDto
            if (updateDto.Symptoms != null)
                medicalRecord.Symptoms = updateDto.Symptoms;

            if (updateDto.PhysicalExamination != null)
                medicalRecord.PhysicalExamination = updateDto.PhysicalExamination;

            if (updateDto.TreatmentPlan != null)
                medicalRecord.TreatmentPlan = updateDto.TreatmentPlan;

            if (updateDto.FollowUpDate != null)
                medicalRecord.FollowUpDate = updateDto.FollowUpDate;

            // Save the updates
            _context.MedicalRecords.Update(medicalRecord);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ConductConsultation(int doctorId, int appointmentId, CreateMedicalRecordDto recordDto, decimal consultationFee)
        {
            // Check if the appointment exists and is scheduled
            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.AppointmentID == appointmentId && a.DoctorID == doctorId);

            if (appointment == null || appointment.Status != "Scheduled")
                return false;

            // Create and save MedicalRecord to get RecordID
            var medicalRecord = new MedicalRecord
            {
                AppointmentID = appointment.AppointmentID,
                DoctorID = doctorId,
                PatientID = appointment.PatientID,
                Symptoms = recordDto.Symptoms,
                PhysicalExamination = recordDto.PhysicalExamination,
                TreatmentPlan = recordDto.TreatmentPlan,
                FollowUpDate = recordDto.FollowUpDate,
                TotalPrice = 0
            };

            _context.MedicalRecords.Add(medicalRecord);
            await _context.SaveChangesAsync();  // Save to get RecordID

            decimal totalTestsPrice = 0;
            decimal totalMedicationsPrice = 0;

            // Add Tests and calculate TotalTestsPrice
            if (recordDto.TestIDs != null && recordDto.TestIDs.Any())
            {
                var selectedTests = await _context.Tests
                    .Where(t => recordDto.TestIDs.Contains(t.TestID))
                    .ToListAsync();

                var medicalRecordTests = selectedTests
                    .Select(test => new MedicalRecordTest { RecordID = medicalRecord.RecordID, TestID = test.TestID })
                    .ToList();

                _context.MedicalRecordTests.AddRange(medicalRecordTests); // Save MedicalRecordTests directly
                totalTestsPrice = selectedTests.Sum(t => t.TestPrice);
                medicalRecord.TotalPrice += totalTestsPrice;
            }

            // Save prescriptions and calculate TotalMedicationsPrice
            if (recordDto.Prescriptions != null && recordDto.Prescriptions.Any())
            {
                var prescriptions = new List<Prescription>();
                foreach (var prescriptionDto in recordDto.Prescriptions)
                {
                    var medication = await _context.Medications.FindAsync(prescriptionDto.MedicationID);

                    if (medication != null)
                    {
                        var prescription = new Prescription
                        {
                            RecordID = medicalRecord.RecordID,
                            MedicationID = prescriptionDto.MedicationID,
                            Dosage = prescriptionDto.Dosage,
                            DurationDays = prescriptionDto.DurationDays,
                            Quantity = prescriptionDto.Quantity,
                            TotalPrice = medication.PricePerUnit * prescriptionDto.Quantity,
                            MedicationName = medication.MedicationName
                        };

                        prescriptions.Add(prescription);
                        totalMedicationsPrice += prescription.TotalPrice;
                        
                    }
                }

                _context.Prescriptions.AddRange(prescriptions); // Add all prescriptions in one operation
                medicalRecord.TotalPrice += totalMedicationsPrice;
                await _context.SaveChangesAsync();
            }

            _context.MedicalRecords.Update(medicalRecord);
            await _context.SaveChangesAsync();

            // Create and save the Billing record
            var billing = new Billing
            {
                PatientID = appointment.PatientID,
                DoctorID = doctorId,
                MedicalRecordID = medicalRecord.RecordID,
                ConsultationFee = consultationFee,
                TotalTestsPrice = totalTestsPrice,
                TotalMedicationsPrice = totalMedicationsPrice,
                GrandTotal = consultationFee + totalTestsPrice + totalMedicationsPrice,
                Status = "Pending"
            };

            _context.Billing.Add(billing);
            await _context.SaveChangesAsync();

            medicalRecord.BillingID = billing.BillingID;
            _context.MedicalRecords.Update(medicalRecord);
            await _context.SaveChangesAsync();

            foreach (var prescription in medicalRecord.Prescriptions)
            {
                prescription.BillingID = billing.BillingID;
                _context.Prescriptions.Update(prescription);
            }
            await _context.SaveChangesAsync();

            await _context.SaveChangesAsync();

            // Update the appointment status to "Completed"
            appointment.Status = "Completed";
            _context.Appointments.Update(appointment);
            await _context.SaveChangesAsync();

            return true;
        }



        // get medical record of a  patient

        public async Task<List<PatientMedicalRecordDto>> GetMedicalRecordsByPatientIdAsync(int patientId)
        {
            var records = await _context.Appointments
                .Where(a => a.PatientID == patientId)
                .Include(a => a.Doctor)
                .Include(a => a.MedicalRecord)
                    .ThenInclude(m => m.MedicalRecordTests)
                        .ThenInclude(mt => mt.Test)  // Correct navigation to access Test
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
                        TestName = mt.Test.TestName,   // Access Test through MedicalRecordTests
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

            return records;
        }



        // mark bill paid 

        public async Task<bool> UpdateBillingStatus(int billingId, int doctorId)
        {
            var billing = await _context.Billing
                .FirstOrDefaultAsync(b => b.BillingID == billingId && b.DoctorID == doctorId);

            if (billing == null || billing.Status == "Paid")
                return false;

            billing.Status = "Paid";
            _context.Billing.Update(billing);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<TestDto>> GetTestsAsync()
        {
            return await _context.Tests
                .Select(t => new TestDto
                {
                    TestID = t.TestID,
                    TestName = t.TestName,
                    TestPrice = t.TestPrice
                })
                .ToListAsync();
        }

        public async Task<List<MedicationDto>> GetMedicationsAsync()
        {
            return await _context.Medications
                .Select(m => new MedicationDto
                {
                    MedicationID = m.MedicationID,
                    MedicationName = m.MedicationName,
                    PricePerUnit = m.PricePerUnit
                })
                .ToListAsync();
        }

        public async Task<bool> AddHoliday(int doctorId, CreateHolidayDto holidayDto)
        {
            var holiday = new DoctorHoliday
            {
                DoctorID = doctorId,
                StartDate = holidayDto.StartDate,
                EndDate = holidayDto.EndDate,
                Status = "Scheduled"
            };

            _context.DoctorHolidays.Add(holiday);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateHoliday(int holidayId, int doctorId, UpdateHolidayDto updateDto)
        {
            var holiday = await _context.DoctorHolidays
                .FirstOrDefaultAsync(h => h.HolidayID == holidayId && h.DoctorID == doctorId);

            if (holiday == null)
                return false;

            holiday.StartDate = updateDto.StartDate;
            holiday.EndDate = updateDto.EndDate;
            holiday.Status = updateDto.Status;

            _context.DoctorHolidays.Update(holiday);
            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<IEnumerable<HolidayDto>> GetHolidays(int doctorId)
        {
            return await _context.DoctorHolidays
                .Where(h => h.DoctorID == doctorId)
                .Select(h => new HolidayDto
                {
                    HolidayID = h.HolidayID,
                    StartDate = h.StartDate,
                    EndDate = h.EndDate,
                    Status = h.Status
                })
                .ToListAsync();
        }

        public async Task<bool> CancelHoliday(int holidayId, int doctorId)
        {
            var holiday = await _context.DoctorHolidays
                .FirstOrDefaultAsync(h => h.HolidayID == holidayId && h.DoctorID == doctorId);

            if (holiday == null || holiday.Status == "Completed")
                return false;

            holiday.Status = "Cancelled";
            _context.DoctorHolidays.Update(holiday);
            await _context.SaveChangesAsync();
            return true;
        }


        //public async Task<Appointment> RescheduleAppointment(int appointmentId, int doctorId, AppointmentRescheduleDto rescheduleDto)
        //{
        //    // Find the appointment and ensure it belongs to the doctor
        //    var appointment = await _context.Appointments
        //        .FirstOrDefaultAsync(a => a.AppointmentID == appointmentId && a.DoctorID == doctorId);

        //    if (appointment == null)
        //        return null;

        //    // Check if the new date falls within any holiday period for the doctor
        //    bool isHoliday = await _context.DoctorHolidays
        //        .AnyAsync(h => h.DoctorID == doctorId
        //                       && h.Status == "Scheduled"
        //                       && rescheduleDto.NewAppointmentDate >= h.StartDate
        //                       && rescheduleDto.NewAppointmentDate <= h.EndDate);

        //    if (isHoliday)
        //        throw new InvalidOperationException("The new appointment date conflicts with your holiday period.");

        //    // Update the appointment date and save
        //    appointment.AppointmentDate = rescheduleDto.NewAppointmentDate;
        //    _context.Appointments.Update(appointment);
        //    await _context.SaveChangesAsync();

        //    return appointment;
        //}

        public async Task<(bool Success, string Message)> RescheduleAppointment(int doctorId, int appointmentId, AppointmentRescheduleDto rescheduleDto)
        {
            // Retrieve the appointment
            var appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.AppointmentID == appointmentId && a.DoctorID == doctorId);

            if (appointment == null)
                return (false, "Appointment not found or unauthorized access.");

            // Check if the new appointment date is in the future
            if (rescheduleDto.NewAppointmentDate <= DateTime.Now)
                return (false, "The new appointment date and time must be in the future.");

            // Check if the new appointment date conflicts with any holiday of the doctor
            bool isHoliday = await _context.DoctorHolidays
                .AnyAsync(h => h.DoctorID == doctorId
                               && h.Status == "Scheduled"
                               && rescheduleDto.NewAppointmentDate >= h.StartDate
                               && rescheduleDto.NewAppointmentDate <= h.EndDate);

            if (isHoliday)
                return (false, "The new appointment date conflicts with the doctor's scheduled holiday.");

            // Update appointment date and time
            appointment.AppointmentDate = rescheduleDto.NewAppointmentDate;
            _context.Appointments.Update(appointment);

            // Save changes
            await _context.SaveChangesAsync();

            return (true, "Appointment rescheduled successfully.");
        }










    }
}
