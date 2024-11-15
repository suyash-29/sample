using System.ComponentModel.DataAnnotations;

namespace AmazeCareAPI.Dtos
{
    public class PrescriptionResponseDto
    {
        public int PrescriptionID { get; set; }
        public string MedicationName { get; set; }
        public string Dosage { get; set; }
        public int DurationDays { get; set; }
    }

}
