using System;

namespace AmazeCareAPI.Dtos
{

    public class MedicalRecordResponseDto
    {
        public int RecordID { get; set; }
        public string PatientName { get; set; }
        public string DoctorName { get; set; }
        public string Symptoms { get; set; }
        public string PhysicalExamination { get; set; }
        public string TreatmentPlan { get; set; }
        public DateTime? FollowUpDate { get; set; }
    }

}
