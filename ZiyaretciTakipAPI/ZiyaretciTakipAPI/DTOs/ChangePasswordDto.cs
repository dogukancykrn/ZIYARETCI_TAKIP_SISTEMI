// Ziyaretçi Takip Sistemi - Şifre Değiştirme DTO'su
namespace ZiyaretciTakipAPI.DTOs
{
    /// <summary>
    /// Admin kullanıcısının şifre değiştirme işlemi için gerekli bilgileri taşıyan Data Transfer Object
    /// Güvenlik açısından mevcut şifre doğrulaması gerektirir
    /// </summary>
    public class ChangePasswordDto
    {
        /// <summary>
        /// Kullanıcının mevcut şifresi (plain text)
        /// Nullable: Opsiyonel alan - güvenlik doğrulaması için kullanılır
        /// Yeni şifre belirlemeden önce mevcut şifrenin doğru olduğunu doğrulamak için gerekli
        /// </summary>
        public string? CurrentPassword { get; set; }
        
        /// <summary>
        /// Kullanıcının yeni şifresi (plain text)
        /// Nullable: Opsiyonel alan
        /// Sunucuda BCrypt ile hash'lenerek güvenli şekilde saklanır
        /// Minimum 6 karakter olmalıdır (controller'da validate edilir)
        /// </summary>
        public string? NewPassword { get; set; }
    }
}
