// Ziyaretçi Takip Sistemi - Ziyaretçi Filtreleme DTO'su
namespace ZiyaretciTakipAPI.DTOs
{
    /// <summary>
    /// Ziyaretçi listesini filtrelemek için kullanılan arama kriterlerini taşıyan Data Transfer Object
    /// Tüm alanlar opsiyoneldir ve boş bırakılan alanlar filtreleme işleminde göz ardı edilir
    /// </summary>
    public class VisitorFilterDto
    {
        /// <summary>
        /// Ziyaretçi adına göre filtreleme
        /// Nullable: Opsiyonel alan - boş bırakılırsa ad filtrelemesi yapılmaz
        /// Kısmi eşleşme destekler (LIKE sorgusu ile case-insensitive arama)
        /// Örnek: "ahmet" -> "Ahmet Yılmaz", "Mehmet Ahmet" gibi kayıtları bulur
        /// </summary>
        public string? FullName { get; set; }
        
        /// <summary>
        /// TC kimlik numarasına göre filtreleme
        /// Nullable: Opsiyonel alan - boş bırakılırsa TC filtrelemesi yapılmaz
        /// Kısmi eşleşme destekler (başlangıç karakterleri ile arama)
        /// Örnek: "123" -> "12345678901" gibi kayıtları bulur
        /// </summary>
        public string? TcNumber { get; set; }
        
        /// <summary>
        /// Başlangıç tarihine göre filtreleme
        /// Nullable: Opsiyonel alan - boş bırakılırsa başlangıç tarihi filtrelemesi yapılmaz
        /// Bu tarih ve sonrasındaki kayıtları getirir (>=)
        /// Giriş zamanı (EnteredAt) alanı ile karşılaştırılır
        /// </summary>
        public DateTime? StartDate { get; set; }
        
        /// <summary>
        /// Bitiş tarihine göre filtreleme
        /// Nullable: Opsiyonel alan - boş bırakılırsa bitiş tarihi filtrelemesi yapılmaz
        /// Bu tarih ve öncesindeki kayıtları getirir (<=)
        /// Giriş zamanı (EnteredAt) alanı ile karşılaştırılır
        /// </summary>
        public DateTime? EndDate { get; set; }
        
        /// <summary>
        /// Aktiflik durumuna göre filtreleme
        /// Nullable: Opsiyonel alan - boş bırakılırsa aktiflik filtrelemesi yapılmaz
        /// true: Sadece aktif ziyaretçiler (ExitedAt == null)
        /// false: Sadece çıkış yapmış ziyaretçiler (ExitedAt != null)
        /// null: Tüm ziyaretçiler (aktif + çıkış yapmış)
        /// </summary>
        public bool? IsActive { get; set; }
    }
}
