namespace ZiyaretciTakipAPI.Models
{
    // Ziyaretçi modelini tanımlayan sınıf
    public class Visitor
    {
        public Guid Id { get; set; }                                    // Benzersiz ziyaretçi kimliği (GUID)
        public required string FullName { get; set; }                  // Ziyaretçinin tam adı (zorunlu)
        public required string TcNumber { get; set; }                  // Ziyaretçinin TC kimlik numarası (zorunlu)
        public required string VisitReason { get; set; }               // Ziyaret nedeni (zorunlu)
        public DateTime EnteredAt { get; set; } = DateTime.UtcNow;     // Giriş tarihi/saati (varsayılan: şu an)
        public DateTime? ExitedAt { get; set; }                        // Çıkış tarihi/saati (opsiyonel - null ise aktif ziyaretçi)
    }
}    