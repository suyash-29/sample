using System.ComponentModel.DataAnnotations;

namespace AmazeCareAPI.Models
{
    public class DoctorHoliday
    {
        [Key]
        public int HolidayID { get; set; }
        public int DoctorID { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = "Scheduled";

        // Navigation property
        public Doctor Doctor { get; set; }
    }

}
