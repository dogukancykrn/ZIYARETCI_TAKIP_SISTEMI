namespace ZiyaretciTakipAPI.DTOs
{
    public class VisitorFilterDto
    {
        public string? FullName { get; set; }
        public string? TcNumber { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool? IsActive { get; set; }
    }
}
