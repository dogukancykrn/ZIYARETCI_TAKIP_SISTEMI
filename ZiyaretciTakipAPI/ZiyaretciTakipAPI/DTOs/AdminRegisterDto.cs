// Ziyaretçi Takip Sistemi - Admin Kayıt DTO'su
namespace ZiyaretciTakipAPI.DTOs
{
    /// <summary>
    /// Yeni admin kullanıcısı kayıt işlemi için gerekli bilgileri taşıyan Data Transfer Object
    /// Self-registration işleminde kullanılır ve kapsamlı validasyon içerir
    /// </summary>
    public class AdminRegisterDto
    {
        /// <summary>
        /// Admin kullanıcısının adı
        /// Required: Bu alan zorunludur ve boş bırakılamaz
        /// </summary>
        public required string FirstName { get; set; }
        
        /// <summary>
        /// Admin kullanıcısının soyadı
        /// Required: Bu alan zorunludur ve boş bırakılamaz
        /// </summary>
        public required string LastName { get; set; }
        
        /// <summary>
        /// Admin kullanıcısının TC kimlik numarası
        /// Required: Bu alan zorunludur ve sistem genelinde benzersiz olmalıdır
        /// 11 haneli Türkiye Cumhuriyeti kimlik numarası
        /// </summary>
        public required string TcNumber { get; set; }
        
        /// <summary>
        /// Admin kullanıcısının e-posta adresi
        /// Required: Bu alan zorunludur ve sistem genelinde benzersiz olmalıdır
        /// Giriş yapırken kullanıcı adı olarak kullanılır
        /// </summary>
        public required string Email { get; set; }
        
        /// <summary>
        /// Admin kullanıcısının telefon numarası
        /// Required: Bu alan zorunludur ve sistem genelinde benzersiz olmalıdır
        /// </summary>
        public required string PhoneNumber { get; set; }
        
        /// <summary>
        /// Admin kullanıcısının şifresi (plain text)
        /// Required: Bu alan zorunludur ve minimum 6 karakter olmalıdır
        /// Sunucuda BCrypt ile hash'lenerek güvenli şekilde saklanır
        /// </summary>
        public required string Password { get; set; }
        
        /// <summary>
        /// Şifre doğrulama alanı
        /// Required: Bu alan zorunludur ve Password alanı ile eşleşmelidir
        /// Client-side ve server-side şifre doğrulaması için kullanılır
        /// </summary>
        public required string ConfirmPassword { get; set; }
        
        /// <summary>
        /// Şube müdürünün e-posta adresi
        /// Required: Yeni admin kaydı bildirimi gönderilecek e-posta adresi
        /// Kayıt işlemi tamamlandığında otomatik bilgilendirme e-postası gönderilir
        /// </summary>
        public required string ManagerEmail { get; set; }
    }
}