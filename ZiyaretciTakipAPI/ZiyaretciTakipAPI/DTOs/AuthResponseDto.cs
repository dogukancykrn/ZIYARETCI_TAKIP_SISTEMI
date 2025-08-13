// Ziyaretçi Takip Sistemi - Kimlik Doğrulama Response DTO'su
namespace ZiyaretciTakipAPI.DTOs;

/// <summary>
/// Başarılı giriş işlemi sonrasında client'a döndürülen kimlik doğrulama yanıt verisi
/// JWT token ve kullanıcı bilgilerini içerir
/// </summary>
public class AuthResponseDto
{
    /// <summary>
    /// JWT access token - API erişimi için kullanılır
    /// Bu token her API isteğinde Authorization header'ında gönderilmelidir
    /// Örnek: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    /// </summary>
    public required string Token { get; set; }
    
    /// <summary>
    /// Giriş yapan admin kullanıcısının detay bilgileri
    /// Hassas bilgiler (şifre vb.) dahil edilmez
    /// </summary>
    public required AdminDto Admin { get; set; }
}

/// <summary>
/// Admin kullanıcısının client'a döndürülen güvenli bilgilerini içeren DTO
/// Şifre hash'i gibi hassas veriler bu DTO'da yer almaz
/// </summary>
public class AdminDto
{
    /// <summary>
    /// Admin kullanıcısının benzersiz kimlik numarası (GUID)
    /// </summary>
    public Guid Id { get; set; }
    
    /// <summary>
    /// Admin kullanıcısının tam adı (ad + soyad)
    /// Required: Bu alan zorunludur
    /// </summary>
    public required string FullName { get; set; }
    
    /// <summary>
    /// Admin kullanıcısının telefon numarası
    /// Required: Bu alan zorunludur
    /// Örnek: "+90 555 123 45 67"
    /// </summary>
    public required string PhoneNumber { get; set; }
    
    /// <summary>
    /// Admin kullanıcısının e-posta adresi
    /// Required: Bu alan zorunludur ve benzersiz olmalıdır
    /// </summary>
    public required string Email { get; set; }
    
    /// <summary>
    /// Admin kullanıcısının sistem rolü
    /// Varsayılan değer: "Admin"
    /// Gelecekte farklı roller (SuperAdmin, Manager vb.) eklenebilir
    /// </summary>
    public string Role { get; set; } = "Admin";
}