namespace AmazeCareAPI.Dtos
{
    public class ConductConsultationRequest
    {
        public CreateMedicalRecordDto MedicalRecord { get; set; }
        public List<TestDto> Tests { get; set; }  // Optional
        public List<PrescriptionDto> Prescriptions { get; set; }  // Optional
    }
}
