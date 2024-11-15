using System;
using System.Threading.Tasks;
using AmazeCareAPI.Models;
using AmazeCareAPI.Data;
using Microsoft.EntityFrameworkCore;
using AmazeCareAPI.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace AmazeCareAPI.Services
{
    public class UserService
    {
        private readonly AmazeCareContext _context;

        public UserService(AmazeCareContext context)
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

        public async Task<Patient> RegisterPatient(User user, string fullName, string email, DateTime dateOfBirth,
            string gender, string contactNumber, string address, string medicalHistory)
        {
            user.RoleID = 1; // RoleID for Patient
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var patient = new Patient
            {
                UserID = user.UserID,
                FullName = fullName,
                Email = email,
                DateOfBirth = dateOfBirth,
                Gender = gender,
                ContactNumber = contactNumber,
                Address = address,
                MedicalHistory = medicalHistory
            };

            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();

            return patient;
        }



    }
}
