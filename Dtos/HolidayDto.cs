namespace AmazeCareAPI.Dtos
{
    public class HolidayDto
    {
        public int HolidayID { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; }
    }
}
