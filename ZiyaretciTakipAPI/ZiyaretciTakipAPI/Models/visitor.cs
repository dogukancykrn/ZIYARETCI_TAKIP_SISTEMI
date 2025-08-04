namespace ZiyaretciTakipAPI.Models
{
    public class Visitor
    {
        public Guid Id { get; set; }
        public required string FullName { get; set; }
        public required string TcNumber { get; set; }
        public required string VisitReason { get; set; }
        public DateTime EnteredAt { get; set; } = DateTime.UtcNow;
        public DateTime? ExitedAt { get; set; }
    }
}    