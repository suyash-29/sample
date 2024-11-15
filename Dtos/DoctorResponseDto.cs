using System.ComponentModel.DataAnnotations;

namespace AmazeCareAPI.Dtos
{
    public class DoctorResponseDto
    {
        public int DoctorID { get; set; }
        public string FullName { get; set; }
        public int ExperienceYears { get; set; }
        public string Qualification { get; set; }
        public string Designation { get; set; }
        public string[] Specializations { get; set; } // Names of specializations
    }

}