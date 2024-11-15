namespace AmazeCareAPI.Dtos
{
    public class AppointmentDto
    {
        public int AppointmentID { get; set; }
        public int PatientID { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string Status { get; set; }
        public string Symptoms { get; set; } // Upcoming, Completed
    }

}
