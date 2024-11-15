using System;
using System.ComponentModel.DataAnnotations;

namespace AmazeCareAPI.Dtos
{

    public class AppointmentCreateDto
    {
        [Required]
        public int PatientID { get; set; }

        [Required]
        public int DoctorID { get; set; }

        [Required]
        public DateTime AppointmentDate { get; set; }

        [MaxLength(500)]
        public string Symptoms { get; set; }
    }

}