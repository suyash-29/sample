using AmazeCareAPI.Models;
using AmazeCareAPI.Data;
using Microsoft.EntityFrameworkCore;
using AmazeCareAPI.Dtos;

namespace AmazeCareAPI.Services
{
    public class AdminService
    {
        private readonly AmazeCareContext _context;

        public AdminService(AmazeCareContext context)
        {
            _context = context;
        }

        public async Task<(bool IsAvailable, string Message)> CheckUsernameAvailabilityAsync(string username)
        {
            bool isAvailable = !await _context.Users.AnyAsync(u => u.Username == username);
            string message = isAvailable
                ? "Username is available."
                : "Username is already taken. Please choose a different username.";

            return (isAvailable, message);
        }


        public async Task<Administrator> RegisterAdmin(string username, string password, string fullName, string email)
        {
            // Check if username is available
            var (isAvailable, message) = await CheckUsernameAvailabilityAsync(username);
            if (!isAvailable)
                throw new InvalidOperationException(message);  // Abort registration if username is taken


            var user = new User
            {
                Username = username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                RoleID = 3
            };

            // Save user to the database
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var admin = new Administrator
            {
                UserID = user.UserID,
                FullName = fullName,
                Email = email
            };

            _context.Administrators.Add(admin);
            await _context.SaveChangesAsync();

            return admin;
        }


        public async Task<Doctor> RegisterDoctor(DoctorRegistrationDto doctorDto)
        {
            // Check if username is available
            var (isAvailable, message) = await CheckUsernameAvailabilityAsync(doctorDto.Username);
            if (!isAvailable)
                throw new InvalidOperationException(message);  // Abort registration if username is taken

            // Create a new user for the doctor with RoleID set to 2 (Doctor)
            var user = new User
            {
                Username = doctorDto.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(doctorDto.Password),
                RoleID = 2
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Create the new doctor entry
            var doctor = new Doctor
            {
                UserID = user.UserID,
                FullName = doctorDto.FullName,
                Email = doctorDto.Email,
                ExperienceYears = doctorDto.ExperienceYears,
                Qualification = doctorDto.Qualification,
                Designation = doctorDto.Designation
            };
            _context.Doctors.Add(doctor);
            await _context.SaveChangesAsync();

            // Assign specializations
            if (doctorDto.SpecializationIds != null)
            {
                var doctorSpecializations = doctorDto.SpecializationIds.Select(specializationId => new DoctorSpecialization
                {
                    DoctorID = doctor.DoctorID,
                    SpecializationID = specializationId
                });
                _context.DoctorSpecializations.AddRange(doctorSpecializations);
            }

            await _context.SaveChangesAsync();
            return doctor;
        }

        public async Task<bool> UpdateDoctorDetails(int doctorId, DoctorUpdateDto doctorDto)
        {
            var doctor = await _context.Doctors
                .Include(d => d.DoctorSpecializations)
                .FirstOrDefaultAsync(d => d.DoctorID == doctorId);

            if (doctor == null)
            {
                // Handle doctor not found scenario, return false or throw an exception
                return false;
            }

            // Update only fields that are provided in the request
            if (!string.IsNullOrEmpty(doctorDto.FullName))
            {
                doctor.FullName = doctorDto.FullName;
            }

            if (!string.IsNullOrEmpty(doctorDto.Email))
            {
                doctor.Email = doctorDto.Email;
            }

            if (doctorDto.ExperienceYears.HasValue)
            {
                doctor.ExperienceYears = doctorDto.ExperienceYears.Value;
            }

            if (!string.IsNullOrEmpty(doctorDto.Qualification))
            {
                doctor.Qualification = doctorDto.Qualification;
            }

            if (!string.IsNullOrEmpty(doctorDto.Designation))
            {
                doctor.Designation = doctorDto.Designation;
            }

            // Update specializations only if `specializationIds` is provided
            if (doctorDto.SpecializationIds != null && doctorDto.SpecializationIds.Any())
            {
                // Remove existing specializations
                var existingSpecializations = _context.DoctorSpecializations
                    .Where(ds => ds.DoctorID == doctorId);
                _context.DoctorSpecializations.RemoveRange(existingSpecializations);

                // Add new specializations
                foreach (var specializationId in doctorDto.SpecializationIds)
                {
                    var doctorSpecialization = new DoctorSpecialization
                    {
                        DoctorID = doctorId,
                        SpecializationID = specializationId
                    };
                    _context.DoctorSpecializations.Add(doctorSpecialization);
                }
            }

            // Save changes to the database
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteDoctor(int userId, int doctorId)
        {
            // Check if the doctor exists and verify the UserID matches
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.DoctorID == doctorId && d.UserID == userId);
            if (doctor == null) return false;

            // Set UserID to null and update Designation to "Inactive"
            doctor.UserID = null;
            doctor.Designation = "Inactive";
            _context.Doctors.Update(doctor);

            // Update appointments to "Canceled" for scheduled appointments only
            var appointments = await _context.Appointments
                                              .Where(a => a.DoctorID == doctorId && a.Status == "Scheduled")
                                              .ToListAsync();
            foreach (var appointment in appointments)
            {
                appointment.Status = "Canceled";
            }
            _context.Appointments.UpdateRange(appointments);

            // Remove the user entry in the Users table
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                _context.Users.Remove(user);
            }

            // Commit changes to the database
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Patient> UpdatePatient(PatientDto patientDto)
        {
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.PatientID == patientDto.PatientID);

            if (patient == null)
            {
                throw new KeyNotFoundException($"Patient with ID {patientDto.PatientID} not found.");
            }

            // Update only fields that are provided
            if (!string.IsNullOrEmpty(patientDto.FullName))
            {
                patient.FullName = patientDto.FullName;
            }

            if (!string.IsNullOrEmpty(patientDto.Email))
            {
                patient.Email = patientDto.Email;
            }

            
            
                patient.DateOfBirth = patientDto.DateOfBirth;
            

            if (!string.IsNullOrEmpty(patientDto.ContactNumber))
            {
                patient.ContactNumber = patientDto.ContactNumber;
            }

            if (!string.IsNullOrEmpty(patientDto.Address))
            {
                patient.Address = patientDto.Address;
            }

            if (!string.IsNullOrEmpty(patientDto.MedicalHistory))
            {
                patient.MedicalHistory = patientDto.MedicalHistory;
            }

            await _context.SaveChangesAsync();
            return patient;
        }

        public async Task<DoctorDto> GetDoctorDetails(int doctorId)
        {
            var doctor = await _context.Doctors
                .Include(d => d.DoctorSpecializations)
                .ThenInclude(ds => ds.Specialization)
                .Include(d => d.DoctorHolidays) // Include holidays in the query
                .FirstOrDefaultAsync(d => d.DoctorID == doctorId);

            if (doctor == null)
            {
                throw new KeyNotFoundException($"Doctor with ID {doctorId} not found.");
            }

            // Map to DoctorDto with holiday information
            var doctorDto = new DoctorDto
            {
                FullName = doctor.FullName,
                ExperienceYears = doctor.ExperienceYears,
                Qualification = doctor.Qualification,
                Designation = doctor.Designation,
                Specializations = doctor.DoctorSpecializations
                    .Select(ds => ds.Specialization.SpecializationName)
                    .ToList(),
                Holidays = doctor.DoctorHolidays
                     
                    .Select(h => new HolidayDto
                    {
                        HolidayID = h.HolidayID,
                        StartDate = h.StartDate,
                        EndDate = h.EndDate,
                        Status = h.Status
                    })
                    .ToList()
            };

            return doctorDto;
        }


        public async Task<Patient> GetPatientDetails(int patientId)
        {
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.PatientID == patientId);

            if (patient == null)
            {
                throw new KeyNotFoundException($"Patient with ID {patientId} not found.");
            }

            return patient;
        }



        public async Task<bool> DeletePatient(int userId, int patientId)
        {
            // Check if the patient exists and verify the UserID matches
            var patient = await _context.Patients.FirstOrDefaultAsync(p => p.PatientID == patientId && p.UserID == userId);
            if (patient == null) return false;

            // Set UserID to null in the Patients table
            patient.UserID = null;
            _context.Patients.Update(patient);

            // Update appointments to "Canceled" for scheduled appointments related to this patient
            var appointments = await _context.Appointments
                                              .Where(a => a.PatientID == patientId && a.Status == "Scheduled")
                                              .ToListAsync();
            foreach (var appointment in appointments)
            {
                appointment.Status = "Canceled";
            }
            _context.Appointments.UpdateRange(appointments);

            // Remove the user entry in the Users table
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                _context.Users.Remove(user);
            }

            // Commit changes to the database
            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<Appointment> RescheduleAppointment(int appointmentId, AppointmentRescheduleDto rescheduleDto)
        {
            // Find the appointment
            var appointment = await _context.Appointments
                .Include(a => a.Doctor)
                .FirstOrDefaultAsync(a => a.AppointmentID == appointmentId);

            if (appointment == null)
                return null;

            // Check if the new date falls within any holiday period for the doctor
            bool isHoliday = await _context.DoctorHolidays
                .AnyAsync(h => h.DoctorID == appointment.DoctorID
                               && h.Status == "Scheduled"
                               && rescheduleDto.NewAppointmentDate >= h.StartDate
                               && rescheduleDto.NewAppointmentDate <= h.EndDate);

            if (isHoliday)
                throw new InvalidOperationException("The new appointment date conflicts with the doctor's holiday period.");

            // Update the appointment date and save
            appointment.AppointmentDate = rescheduleDto.NewAppointmentDate;
            _context.Appointments.Update(appointment);
            await _context.SaveChangesAsync();

            return appointment;
        }


        public async Task<Appointment> ViewAppointmentDetails(int appointmentId)
        {
            return await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.Doctor)
                .FirstOrDefaultAsync(a => a.AppointmentID == appointmentId);
        }

        // Method to update an existing holiday for a doctor with validation on DoctorID
        public async Task<bool> UpdateHoliday(int doctorId, int holidayId, DateTime newStartDate, DateTime newEndDate)
        {
            var holiday = await _context.DoctorHolidays
                .FirstOrDefaultAsync(h => h.HolidayID == holidayId && h.DoctorID == doctorId);

            if (holiday == null)
                throw new KeyNotFoundException($"Holiday with ID {holidayId} not found for Doctor ID {doctorId}.");

            // Update the start and end dates
            holiday.StartDate = newStartDate;
            holiday.EndDate = newEndDate;

            // Save changes to the database
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<string> CancelHoliday(int doctorId, int holidayId)
        {
            var holiday = await _context.DoctorHolidays
                .FirstOrDefaultAsync(h => h.HolidayID == holidayId && h.DoctorID == doctorId);

            if (holiday == null)
                throw new KeyNotFoundException($"Holiday with ID {holidayId} not found for Doctor ID {doctorId}.");

            // Check if the holiday is already "Cancelled" or "Completed"
            if (holiday.Status == "Cancelled")
                return "Holiday is already cancelled.";

            if (holiday.Status == "Completed")
                return "Holiday is already completed and cannot be cancelled.";

            // Set the status to "Cancelled"
            holiday.Status = "Cancelled";

            // Save changes to the database
            await _context.SaveChangesAsync();
            return "Holiday cancelled successfully.";
        }


    }
}
