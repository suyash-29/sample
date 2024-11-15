using System.ComponentModel.DataAnnotations;

namespace AmazeCareAPI.Dtos
{
    public class MedicalRecordCreateDto
    {
        [Required]
        public int AppointmentID { get; set; }

        [Required]
        public int DoctorID { get; set; }

        public string Symptoms { get; set; }
        public string PhysicalExamination { get; set; }
        public string TreatmentPlan { get; set; }
        public DateTime? FollowUpDate { get; set; }
    }
}
