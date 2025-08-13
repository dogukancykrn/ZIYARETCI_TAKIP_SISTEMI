using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ZiyaretciTakipAPI.Models;

namespace ZiyaretciTakipAPI.Services
{
    // JWT token üretimi ve yönetimi için servis sınıfı
    // Service class for JWT token generation and management
    public class JwtService : IJwtService
    {
        // Yapılandırma bilgilerine erişim için dependency injection
        // Dependency injection for accessing configuration settings
        private readonly IConfiguration _configuration;

        // JwtService constructor'ı - yapılandırma bağımlılığını enjekte eder
        // JwtService constructor - injects configuration dependency
        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // Admin kullanıcısı için JWT token üretir
        // Generates JWT token for admin user
        public string GenerateToken(Admin admin)
        {
            // JWT yapılandırma ayarlarını al
            // Get JWT configuration settings
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            var key = Encoding.ASCII.GetBytes(secretKey!);

            // Token tanımlayıcısını oluştur - kullanıcı bilgileri ve claim'ler
            // Create token descriptor - user information and claims
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, admin.Id.ToString()), // Kullanıcı ID'si / User ID
                    new Claim(ClaimTypes.Email, admin.Email),                   // E-posta adresi / Email address
                    new Claim(ClaimTypes.Name, admin.FullName),                 // Tam ad / Full name
                    new Claim(ClaimTypes.Role, admin.Role)                      // Kullanıcı rolü / User role
                }),
                Expires = DateTime.UtcNow.AddDays(Convert.ToInt32(jwtSettings["ExpiryInDays"])), // Token süresi / Token expiry
                Issuer = jwtSettings["Issuer"],     // Token yayıncısı / Token issuer
                Audience = jwtSettings["Audience"], // Token hedef kitlesi / Token audience
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature) // İmzalama bilgileri / Signing credentials
            };

            // Token handler ile token oluştur ve string olarak döndür
            // Create token with token handler and return as string
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}