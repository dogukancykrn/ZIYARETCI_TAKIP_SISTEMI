// Ziyaretçi Takip Sistemi - Giriş DTO'su
namespace ZiyaretciTakipAPI.DTOs;

/// <summary>
/// Kullanıcı giriş işlemi için gerekli bilgileri taşıyan Data Transfer Object (DTO)
/// API endpoint'ine gönderilen JSON verilerini bu sınıfa map etmek için kullanılır
/// </summary>
public class LoginDto
{
    /// <summary>
    /// Kullanıcının e-posta adresi
    /// Required: Bu alan zorunludur ve boş bırakılamaz
    /// Örnek: "admin@banka.com"
    /// </summary>
    public required string Email { get; set; }
    
    /// <summary>
    /// Kullanıcının şifresi (plain text olarak gönderilir)
    /// Required: Bu alan zorunludur ve boş bırakılamaz
    /// Not: Şifre sunucuda BCrypt ile hash'lenerek doğrulanır
    /// </summary>
    public required string Password { get; set; }
}
