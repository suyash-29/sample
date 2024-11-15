using System;

namespace AmazeCareAPI.Dtos
{
    public class AppointmentResponseDto
    {
        public int AppointmentID { get; set; }
        public string PatientName { get; set; }
        public string DoctorName { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string Status { get; set; }
        public string Symptoms { get; set; }
    }
}
