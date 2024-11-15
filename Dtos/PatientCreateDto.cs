using System;
using System.ComponentModel.DataAnnotations;

namespace AmazeCareAPI.Dtos
{
    public class PatientCreateDto
    {
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; }

        public DateTime? DateOfBirth { get; set; }

        [MaxLength(10)]
        public string Gender { get; set; }

        [MaxLength(15)]
        public string ContactNumber { get; set; }

        [MaxLength(200)]
        public string Address { get; set; }

        public string MedicalHistory { get; set; }
    }
}
