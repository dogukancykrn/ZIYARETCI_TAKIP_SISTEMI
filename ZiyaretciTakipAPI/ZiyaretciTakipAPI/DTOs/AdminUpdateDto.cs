// Gerekli using direktifi
using System.Text.Json.Serialization; // JSON serialization attribute'ları için

// Ziyaretçi Takip Sistemi - Admin Güncelleme DTO'su
namespace ZiyaretciTakipAPI.DTOs
{
    /// <summary>
    /// Mevcut admin kullanıcısının profil bilgilerini güncellemek için kullanılan Data Transfer Object
    /// Sadece güncellenebilir alanları içerir (şifre güncelleme ayrı endpoint'te yapılır)
    /// </summary>
    public class AdminUpdateDto
    {
        /// <summary>
        /// Admin kullanıcısının güncellenmiş tam adı (ad + soyad)
        /// Required: Bu alan zorunludur ve boş bırakılamaz
        /// JSON property name: "fullName" (camelCase)
        /// </summary>
        [JsonPropertyName("fullName")]
        public required string FullName { get; set; }

        /// <summary>
        /// Admin kullanıcısının güncellenmiş e-posta adresi
        /// Required: Bu alan zorunludur ve sistem genelinde benzersiz olmalıdır
        /// E-posta değişikliği durumunda benzersizlik kontrolü yapılır
        /// JSON property name: "email" (camelCase)
        /// </summary>
        [JsonPropertyName("email")]
        public required string Email { get; set; }

        /// <summary>
        /// Admin kullanıcısının güncellenmiş telefon numarası
        /// Required: Bu alan zorunludur
        /// JSON property name: "phoneNumber" (camelCase)
        /// </summary>
        [JsonPropertyName("phoneNumber")]
        public required string PhoneNumber { get; set; }
    }
}
