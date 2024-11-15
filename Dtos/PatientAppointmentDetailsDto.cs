namespace AmazeCareAPI.Dtos
{
    public class PatientAppointmentDetailsDto
    {
        public int AppointmentID { get; set; }
        public DateTime AppointmentDate { get; set; }
        public MedicalRecordDto MedicalRecord { get; set; }
        public BillingDto Billing { get; set; }
    }
}
