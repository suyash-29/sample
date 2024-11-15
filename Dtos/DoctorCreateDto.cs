using System.ComponentModel.DataAnnotations;

namespace AmazeCareAPI.Dtos
{
    public class DoctorCreateDto
    {
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; }

        public int ExperienceYears { get; set; }

        [MaxLength(100)]
        public string Qualification { get; set; }

        [MaxLength(50)]
        public string Designation { get; set; }

        public int[] SpecializationIDs { get; set; } // List of specialization IDs
    }
}
