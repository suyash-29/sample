namespace AmazeCareAPI.Dtos
{
    public class PatientUpdateDto
    {
        public string FullName { get; set; }
        public string ContactNumber { get; set; }
        public string Address { get; set; }
        public string MedicalHistory { get; set; }

        // Optionally, other fields can be included if you decide they can be updated.
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; }
    }
}
