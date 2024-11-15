namespace AmazeCareAPI.Dtos
{
    public class UpdateHolidayDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; }
    }
}
