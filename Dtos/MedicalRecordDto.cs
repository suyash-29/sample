namespace AmazeCareAPI.Dtos
{
    public class MedicalRecordDto
    {
        public int RecordID { get; set; }
        public string Symptoms { get; set; }
        public string PhysicalExamination { get; set; }
        public string TreatmentPlan { get; set; }
        public DateTime? FollowUpDate { get; set; }
        public List<TestDto> Tests { get; set; }
        public List<PrescriptionDto> Prescriptions { get; set; }
    }
}
