namespace AmazeCareAPI.Dtos
{
    public class MedicalRecordUpdateDto
    {
        public string Symptoms { get; set; }
        public string PhysicalExamination { get; set; }
        public string TreatmentPlan { get; set; }
        public DateTime? FollowUpDate { get; set; }
    }
}
