// Gerekli using direktifleri
using Microsoft.AspNetCore.Mvc;           // MVC controller için
using Microsoft.AspNetCore.Authorization; // Authorization attribute'ları için
using ZiyaretciTakipAPI.DTOs;             // Data Transfer Object'lar için
using ZiyaretciTakipAPI.Models;           // Model sınıfları için
using ZiyaretciTakipAPI.Services;         // Servis sınıfları için
using ZiyaretciTakipAPI.Data;             // Database context için
using BCrypt.Net;                         // Şifre hashleme için
using Microsoft.EntityFrameworkCore;     // Entity Framework Core için
using System.Security.Claims;            // JWT Claims için

namespace ZiyaretciTakipAPI.Controllers
{
    // API Controller attribute'ları
    [ApiController]                    // Bu sınıfın bir API controller olduğunu belirtir
    [Route("api/[controller]")]        // Route template'i: api/auth
    public class AuthController : ControllerBase
    {
        // Dependency Injection için readonly field'lar
        private readonly IJwtService _jwtService;        // JWT token oluşturma servisi
        private readonly PostgreSqlDbContext _context;  // Veritabanı context'i
        private readonly EmailService _emailService;    // E-posta gönderme servisi

        // Constructor - Dependency Injection
        public AuthController(IJwtService jwtService, PostgreSqlDbContext context, EmailService emailService)
        {
            _jwtService = jwtService;   // JWT servisini ata
            _context = context;         // Database context'ini ata
            _emailService = emailService; // Email servisini ata
        }

        // Giriş yapma endpoint'i - POST api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                // Debug amaçlı giriş bilgilerini konsola yazdır
                Console.WriteLine($"Login attempt - Email: {loginDto.Email}, Password: {loginDto.Password}");
                
                // Veritabanında email ile admin ara (büyük/küçük harf duyarlı değil)
                var admin = await _context.Admins.FirstOrDefaultAsync(a => a.Email == loginDto.Email);

                // Admin bulunamadıysa hata döndür - güvenlik için genel mesaj
                if (admin == null)
                {
                    Console.WriteLine("Admin not found!"); // Debug log
                    return Unauthorized(new { 
                        success = false, 
                        message = "Geçersiz email veya şifre!" // Güvenlik için spesifik bilgi vermiyoruz
                    });
                }

                Console.WriteLine($"Found admin: {admin.Email}, Hash: {admin.PasswordHash}"); // Debug log
                
                // Şifre kontrolü - BCrypt ile hash'lenmiş şifreyi doğrula
                // BCrypt otomatik olarak salt ve hash karşılaştırması yapar
                var isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, admin.PasswordHash);
                Console.WriteLine($"Password verification result: {isPasswordValid}");
                
                // Şifre yanlışsa hata döndür - güvenlik için aynı mesaj
                if (!isPasswordValid)
                {
                    Console.WriteLine("Password verification failed!");
                    return Unauthorized(new { 
                        success = false, 
                        message = "Geçersiz email veya şifre!" // Güvenlik için aynı hata mesajı
                    });
                }

                // Giriş başarılı - JWT token oluştur
                var token = _jwtService.GenerateToken(admin);

                // Response DTO'sunu hazırla - hassas bilgileri dahil etme
                var response = new AuthResponseDto
                {
                    Token = token,                         // JWT access token
                    Admin = new AdminDto                   // Admin bilgileri (şifre hariç)
                    {
                        Id = admin.Id,                     // Benzersiz admin ID'si
                        FullName = admin.FullName,         // Tam adı
                        Email = admin.Email,               // E-posta adresi
                        PhoneNumber = admin.PhoneNumber,   // Telefon numarası
                        Role = admin.Role                  // Yetki rolü
                    }
                };

                // Başarılı giriş response'u döndür
                return Ok(new { 
                    success = true, 
                    message = "Giriş başarılı!", 
                    data = response 
                });
            }
            catch (Exception ex)
            {
                // Hata loglarını yazdır - production'da daha güvenli logging kullanılmalı
                Console.WriteLine($"Login error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                
                // Genel sunucu hatası döndür - güvenlik açısından detay vermiyoruz
                return StatusCode(500, new { 
                    success = false, 
                    message = "Sunucu hatası!", 
                    error = ex.Message // Development ortamı için - production'da kaldırılmalı
                });
            }
        }

        // Test endpoint'i - API'nin çalışıp çalışmadığını kontrol etmek için
        [HttpGet("test")]
        public async Task<IActionResult> Test()
        {
            // Veritabanı bağlantısını test et ve mevcut adminleri listele
            var admins = await _context.Admins.Select(a => new { a.Email, a.FullName }).ToListAsync();
            
            return Ok(new { 
                message = "Auth API çalışıyor!", 
                timestamp = DateTime.Now,           // Sunucu zamanı
                admins = admins                     // Mevcut admin listesi (güvenlik: sadece email ve isim)
            });
        }

        // Profil güncelleme endpoint'i - Yetkilendirme gerekli
        [HttpPut("profile")]
        [Authorize] // JWT token gerekli
        public async Task<IActionResult> UpdateProfile([FromBody] AdminUpdateDto updateDto)
        {
            try
            {
                // JWT token'dan admin email'ini al (Claims'den)
                var currentEmail = User.FindFirst(ClaimTypes.Email)?.Value;
                
                // Token geçersizse hata döndür
                if (string.IsNullOrEmpty(currentEmail))
                {
                    return Unauthorized(new { success = false, message = "Geçersiz token!" });
                }

                // Mevcut admin'i veritabanından bul
                var admin = await _context.Admins.FirstOrDefaultAsync(a => a.Email == currentEmail);
                
                // Admin bulunamazsa (olmaması gereken durum)
                if (admin == null)
                {
                    return BadRequest(new { success = false, message = "Admin bulunamadı!" });
                }

                // Profil bilgilerini güncelle
                admin.FullName = updateDto.FullName;         // Tam adı güncelle
                admin.PhoneNumber = updateDto.PhoneNumber;   // Telefon numarasını güncelle
                
                // Email değişikliği varsa benzersizlik kontrolü yap
                if (admin.Email != updateDto.Email)
                {
                    // Yeni email'in başka admin tarafından kullanılıp kullanılmadığını kontrol et
                    var existingAdmin = await _context.Admins.FirstOrDefaultAsync(a => a.Email == updateDto.Email);
                    if (existingAdmin != null)
                    {
                        return BadRequest(new { success = false, message = "Bu email adresi zaten kullanılıyor!" });
                    }
                    admin.Email = updateDto.Email; // Email güncelleme onaylandı
                }

                // Değişiklikleri veritabanına kaydet
                // Değişiklikleri veritabanına kaydet
                await _context.SaveChangesAsync();

                // Başarılı güncelleme response'u döndür
                return Ok(new { 
                    success = true, 
                    message = "Profil başarıyla güncellendi!",
                    admin = new {                              // Güncellenmiş admin bilgileri
                        admin.Id,                              // Admin ID
                        admin.FullName,                        // Güncellenmiş tam ad
                        admin.Email,                           // Güncellenmiş email
                        admin.PhoneNumber,                     // Güncellenmiş telefon
                        admin.Role                             // Rol (değişmez)
                    }
                });
            }
            catch (Exception ex)
            {
                // Profil güncelleme hatası
                return StatusCode(500, new { 
                    success = false, 
                    message = "Profil güncellenirken hata oluştu!", 
                    error = ex.Message 
                });
            }
        }

        // Şifre değiştirme endpoint'i - Yetkilendirme gerekli
        [HttpPost("change-password")]
        [Authorize] // JWT token gerekli
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            try
            {
                // JWT token'dan mevcut kullanıcının email'ini al
                var currentEmail = User.FindFirst(ClaimTypes.Email)?.Value;
                if (string.IsNullOrEmpty(currentEmail))
                {
                    return Unauthorized(new { success = false, message = "Geçersiz token!" });
                }
                
                // Mevcut admin'i veritabanından bul
                var admin = await _context.Admins.FirstOrDefaultAsync(a => a.Email == currentEmail);
                if (admin == null)
                {
                    return BadRequest(new { success = false, message = "Admin bulunamadı!" });
                }
                
                // Mevcut şifreyi doğrula - güvenlik için eski şifre kontrolü
                if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, admin.PasswordHash))
                {
                    return BadRequest(new { success = false, message = "Mevcut şifre yanlış!" });
                }
                
                // Yeni şifreyi BCrypt ile hashle ve kaydet
                admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
                await _context.SaveChangesAsync();
                
                // Başarılı şifre değişikliği response'u
                return Ok(new { success = true, message = "Şifre başarıyla güncellendi!" });
            }
            catch (Exception ex)
            {
                // Şifre değiştirme hatası
                return StatusCode(500, new { 
                    success = false, 
                    message = "Şifre güncellenirken hata oluştu!", 
                    error = ex.Message 
                });
            }
        }

        // Yeni admin kayıt endpoint'i - Herkes erişebilir (self-registration)
        [HttpPost("register-admin")]
        public async Task<IActionResult> RegisterAdmin([FromBody] AdminRegisterDto registerDto)
        {
            try
            {
                // Şifre doğrulama - iki şifre alanı eşleşmeli
                if (registerDto.Password != registerDto.ConfirmPassword)
                {
                    return BadRequest(new { 
                        success = false, 
                        message = "Şifreler eşleşmiyor!" 
                    });
                }

                // Email benzersizlik kontrolü - aynı email ile başka admin var mı?
                var existingAdmin = await _context.Admins.FirstOrDefaultAsync(a => a.Email == registerDto.Email);
                if (existingAdmin != null)
                {
                    return BadRequest(new { 
                        success = false, 
                        message = "Bu email adresi zaten kayıtlı!" 
                    });
                }

                // TC kimlik numarası benzersizlik kontrolü
                var existingTc = await _context.Admins.FirstOrDefaultAsync(a => a.TcNumber == registerDto.TcNumber);
                if (existingTc != null)
                {
                    return BadRequest(new { 
                        success = false, 
                        message = "Bu TC kimlik numarası zaten kayıtlı!" 
                    });
                }

                // Telefon numarası benzersizlik kontrolü
                var existingPhone = await _context.Admins.FirstOrDefaultAsync(a => a.PhoneNumber == registerDto.PhoneNumber);
                if (existingPhone != null)
                {
                    return BadRequest(new { 
                        success = false, 
                        message = "Bu telefon numarası zaten kayıtlı!" 
                    });
                }

                // Yeni admin entity'sini oluştur
                var admin = new Admin
                {
                    Id = Guid.NewGuid(),                                              // Benzersiz ID
                    FullName = $"{registerDto.FirstName} {registerDto.LastName}",    // Tam ad birleştirme
                    FirstName = registerDto.FirstName,                               // Ad
                    LastName = registerDto.LastName,                                 // Soyad
                    Email = registerDto.Email,                                       // E-posta
                    PhoneNumber = registerDto.PhoneNumber,                           // Telefon
                    TcNumber = registerDto.TcNumber,                                 // TC kimlik no
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password), // Şifre hash'leme
                    CreatedAt = DateTime.UtcNow,                                     // Oluşturma zamanı (UTC)
                    UpdatedAt = DateTime.UtcNow                                      // Güncelleme zamanı (UTC)
                };

                // Yeni admin'i veritabanına ekle
                _context.Admins.Add(admin);
                await _context.SaveChangesAsync();

                // Yeni admin'i veritabanına ekle
                _context.Admins.Add(admin);
                await _context.SaveChangesAsync();

                // Şube müdürüne e-posta bildirimini gönder (isteğe bağlı)
                if (!string.IsNullOrEmpty(registerDto.ManagerEmail))
                {
                    try
                    {
                        // E-posta konusu ve içeriği hazırla
                        string subject = "Yeni Yönetici Kaydı";
                        string body = $@"
                        <html>
                        <head>
                            <style>
                                body {{ font-family: Arial, sans-serif; color: #333; }}
                                .container {{ padding: 20px; }}
                                .header {{ background-color: #8B0000; color: white; padding: 10px; text-align: center; }}
                                .content {{ padding: 20px; }}
                                .footer {{ background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; }}
                            </style>
                        </head>
                        <body>
                            <div class='container'>
                                <div class='header'>
                                    <h2>Ziyaretçi Takip Sistemi - Yeni Yönetici Bildirimi</h2>
                                </div>
                                <div class='content'>
                                    <p>Sayın Şube Müdürü,</p>
                                    <p>Ziyaretçi Takip Sistemi'ne yeni bir yönetici kaydı yapılmıştır. Yeni yönetici bilgileri aşağıdadır:</p>
                                    <p><b>Ad Soyad:</b> {admin.FullName}</p>
                                    <p><b>E-posta:</b> {admin.Email}</p>
                                    <p><b>Telefon:</b> {admin.PhoneNumber}</p>
                                    <p><b>Kayıt Tarihi:</b> {admin.CreatedAt}</p>
                                    <p>Bu bir otomatik bilgilendirme mesajıdır. Lütfen bu e-postaya yanıt vermeyiniz.</p>
                                </div>
                                <div class='footer'>
                                    <p>© {DateTime.Now.Year} Banka Ziyaretçi Takip Sistemi</p>
                                </div>
                            </div>
                        </body>
                        </html>";

                        // E-posta servisini kullanarak bildirim gönder
                        await _emailService.SendEmailAsync(registerDto.ManagerEmail, subject, body);
                    }
                    catch (Exception ex)
                    {
                        // E-posta gönderimi başarısız olsa da admin kaydı başarılı
                        // Hatayı logla ama işlemi başarısız sayma
                        Console.WriteLine($"Email sending failed: {ex.Message}");
                    }
                }

                // Başarılı kayıt response'u döndür
                return Ok(new { 
                    success = true, 
                    message = "Yönetici başarıyla kaydedildi!",
                    data = new {                                   // Yeni admin bilgileri (hassas veriler hariç)
                        id = admin.Id,                             // Admin ID
                        fullName = admin.FullName,                 // Tam ad
                        firstName = admin.FirstName,               // Ad
                        lastName = admin.LastName,                 // Soyad
                        email = admin.Email,                       // E-posta
                        phoneNumber = admin.PhoneNumber,           // Telefon
                        tcNumber = admin.TcNumber                  // TC kimlik no
                    }
                });
            }
            catch (Exception ex)
            {
                // Kayıt işlemi hatası
                return StatusCode(500, new { 
                    success = false, 
                    message = "Kayıt işlemi sırasında hata oluştu!", 
                    error = ex.Message 
                });
            }
        }

        // Test amaçlı admin oluşturma endpoint'i - sadece development'ta kullanılmalı
        [HttpPost("create-test-admin")]
        public async Task<IActionResult> CreateTestAdmin()
        {
            try
            {
                // Zaten admin var mı kontrol et
                var existingAdmin = await _context.Admins.FirstOrDefaultAsync(a => a.Email == "admin@test.com");
                if (existingAdmin != null)
                {
                    return BadRequest(new { success = false, message = "Test admin zaten mevcut!" });
                }

                // Test admin oluştur
                var testAdmin = new Admin
                {
                    Id = Guid.NewGuid(),
                    FullName = "Test Admin",
                    FirstName = "Test",
                    LastName = "Admin",
                    TcNumber = "12345678901",
                    Email = "admin@test.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"), // Test şifresi: admin123
                    PhoneNumber = "1234567890",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Admins.Add(testAdmin);
                await _context.SaveChangesAsync();

                return Ok(new { 
                    success = true, 
                    message = "Test admin oluşturuldu!", 
                    data = new { 
                        email = "admin@test.com", 
                        password = "admin123" 
                    } 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    success = false, 
                    message = "Test admin oluşturulurken hata oluştu!", 
                    error = ex.Message 
                });
            }
        }
    }
}