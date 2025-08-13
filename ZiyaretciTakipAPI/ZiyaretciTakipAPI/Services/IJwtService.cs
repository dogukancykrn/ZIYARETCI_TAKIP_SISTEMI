using ZiyaretciTakipAPI.Models;

namespace ZiyaretciTakipAPI.Services
{
    // JWT token işlemleri için interface tanımı
    // Interface definition for JWT token operations
    public interface IJwtService
    {
        // Admin kullanıcısı için JWT token üretir
        // Generates JWT token for admin user
        string GenerateToken(Admin admin);
    }
}