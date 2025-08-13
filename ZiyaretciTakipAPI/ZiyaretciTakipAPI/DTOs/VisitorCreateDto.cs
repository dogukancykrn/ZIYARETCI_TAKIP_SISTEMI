// Gerekli using direktifi
using System.Text.Json.Serialization; // JSON serialization attribute'ları için

/// <summary>
/// Yeni ziyaretçi kaydı oluşturmak için gerekli bilgileri taşıyan Data Transfer Object
/// Ziyaretçi giriş formundan gelen verilerin API'ye aktarılması için kullanılır
/// </summary>
public class VisitorCreateDto
{
    /// <summary>
    /// Ziyaretçinin tam adı (ad + soyad)
    /// Required: Bu alan zorunludur ve boş bırakılamaz
    /// JSON property name: "fullName" (camelCase frontend ile uyumlu)
    /// Örnek: "Ahmet Yılmaz"
    /// </summary>
    [JsonPropertyName("fullName")]
    public required string FullName { get; set; }

    /// <summary>
    /// Ziyaretçinin TC kimlik numarası
    /// Required: Bu alan zorunludur ve boş bırakılamaz
    /// 11 haneli Türkiye Cumhuriyeti kimlik numarası
    /// JSON property name: "tcNumber" (camelCase frontend ile uyumlu)
    /// Örnek: "12345678901"
    /// </summary>
    [JsonPropertyName("tcNumber")]
    public required string TcNumber { get; set; }

    /// <summary>
    /// Ziyaretin amacı/nedeni
    /// Required: Bu alan zorunludur ve boş bırakılamaz
    /// JSON property name: "visitReason" (camelCase frontend ile uyumlu)
    /// Örnek: "Kredi başvurusu", "Hesap açma", "Müşteri hizmetleri"
    /// </summary>
    [JsonPropertyName("visitReason")]
    public required string VisitReason { get; set; }
}
