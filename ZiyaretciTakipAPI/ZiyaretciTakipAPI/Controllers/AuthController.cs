using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ZiyaretciTakipAPI.DTOs;
using ZiyaretciTakipAPI.Models;
using ZiyaretciTakipAPI.Services;
using ZiyaretciTakipAPI.Data;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ZiyaretciTakipAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IJwtService _jwtService;
        private readonly PostgreSqlDbContext _context;
        private readonly EmailService _emailService;

        public AuthController(IJwtService jwtService, PostgreSqlDbContext context, EmailService emailService)
        {
            _jwtService = jwtService;
            _context = context;
            _emailService = emailService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                // Debug log
                Console.WriteLine($"Login attempt - Email: {loginDto.Email}, Password: {loginDto.Password}");
                
                // Admin'i email ile bul
                var admin = await _context.Admins.FirstOrDefaultAsync(a => a.Email == loginDto.Email);

                if (admin == null)
                {
                    Console.WriteLine("Admin not found!");
                    return Unauthorized(new { 
                        success = false, 
                        message = "Geçersiz email veya şifre!" 
                    });
                }

                Console.WriteLine($"Found admin: {admin.Email}, Hash: {admin.PasswordHash}");
                
                // Şifre kontrolü
                var isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, admin.PasswordHash);
                Console.WriteLine($"Password verification result: {isPasswordValid}");
                
                if (!isPasswordValid)
                {
                    Console.WriteLine("Password verification failed!");
                    return Unauthorized(new { 
                        success = false, 
                        message = "Geçersiz email veya şifre!" 
                    });
                }

                // JWT token oluştur
                var token = _jwtService.GenerateToken(admin);

                var response = new AuthResponseDto
                {
                    Token = token,
                    Admin = new AdminDto
                    {
                        Id = admin.Id,
                        FullName = admin.FullName,
                        Email = admin.Email,
                        PhoneNumber = admin.PhoneNumber,
                        Role = admin.Role
                    }
                };

                return Ok(new { 
                    success = true, 
                    message = "Giriş başarılı!", 
                    data = response 
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Login error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Sunucu hatası!", 
                    error = ex.Message 
                });
            }
        }

        [HttpGet("test")]
        public async Task<IActionResult> Test()
        {
            var admins = await _context.Admins.Select(a => new { a.Email, a.FullName }).ToListAsync();
            return Ok(new { 
                message = "Auth API çalışıyor!", 
                timestamp = DateTime.Now,
                admins = admins
            });
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] AdminUpdateDto updateDto)
        {
            try
            {
                // JWT token'dan admin email'ini al
                var currentEmail = User.FindFirst(ClaimTypes.Email)?.Value;
                
                if (string.IsNullOrEmpty(currentEmail))
                {
                    return Unauthorized(new { success = false, message = "Geçersiz token!" });
                }

                var admin = await _context.Admins.FirstOrDefaultAsync(a => a.Email == currentEmail);
                
                if (admin == null)
                {
                    return BadRequest(new { success = false, message = "Admin bulunamadı!" });
                }

                // Profil bilgilerini güncelle
                admin.FullName = updateDto.FullName;
                admin.PhoneNumber = updateDto.PhoneNumber;
                
                // Email değişikliği varsa kontrol et
                if (admin.Email != updateDto.Email)
                {
                    var existingAdmin = await _context.Admins.FirstOrDefaultAsync(a => a.Email == updateDto.Email);
                    if (existingAdmin != null)
                    {
                        return BadRequest(new { success = false, message = "Bu email adresi zaten kullanılıyor!" });
                    }
                    admin.Email = updateDto.Email;
                }

                await _context.SaveChangesAsync();

                return Ok(new { 
                    success = true, 
                    message = "Profil başarıyla güncellendi!",
                    admin = new {
                        admin.Id,
                        admin.FullName,
                        admin.Email,
                        admin.PhoneNumber,
                        admin.Role
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Profil güncellenirken hata oluştu!", error = ex.Message });
            }
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            try
            {
                var currentEmail = User.FindFirst(ClaimTypes.Email)?.Value;
                if (string.IsNullOrEmpty(currentEmail))
                {
                    return Unauthorized(new { success = false, message = "Geçersiz token!" });
                }
                var admin = await _context.Admins.FirstOrDefaultAsync(a => a.Email == currentEmail);
                if (admin == null)
                {
                    return BadRequest(new { success = false, message = "Admin bulunamadı!" });
                }
                // Mevcut şifreyi doğrula
                if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, admin.PasswordHash))
                {
                    return BadRequest(new { success = false, message = "Mevcut şifre yanlış!" });
                }
                // Yeni şifreyi hashle ve kaydet
                admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
                await _context.SaveChangesAsync();
                return Ok(new { success = true, message = "Şifre başarıyla güncellendi!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Şifre güncellenirken hata oluştu!", error = ex.Message });
            }
        }

        [HttpPost("register-admin")]
        public async Task<IActionResult> RegisterAdmin([FromBody] AdminRegisterDto registerDto)
        {
            try
            {
                // Şifre doğrulama
                if (registerDto.Password != registerDto.ConfirmPassword)
                {
                    return BadRequest(new { 
                        success = false, 
                        message = "Şifreler eşleşmiyor!" 
                    });
                }

                // Email zaten var mı kontrol et
                var existingAdmin = await _context.Admins.FirstOrDefaultAsync(a => a.Email == registerDto.Email);
                if (existingAdmin != null)
                {
                    return BadRequest(new { 
                        success = false, 
                        message = "Bu email adresi zaten kayıtlı!" 
                    });
                }

                // TC kimlik no zaten var mı kontrol et
                var existingTc = await _context.Admins.FirstOrDefaultAsync(a => a.TcNumber == registerDto.TcNumber);
                if (existingTc != null)
                {
                    return BadRequest(new { 
                        success = false, 
                        message = "Bu TC kimlik numarası zaten kayıtlı!" 
                    });
                }

                // Telefon no zaten var mı kontrol et
                var existingPhone = await _context.Admins.FirstOrDefaultAsync(a => a.PhoneNumber == registerDto.PhoneNumber);
                if (existingPhone != null)
                {
                    return BadRequest(new { 
                        success = false, 
                        message = "Bu telefon numarası zaten kayıtlı!" 
                    });
                }

                // Yeni admin oluştur
                var admin = new Admin
                {
                    Id = Guid.NewGuid(),
                    FullName = $"{registerDto.FirstName} {registerDto.LastName}",
                    FirstName = registerDto.FirstName,
                    LastName = registerDto.LastName,
                    Email = registerDto.Email,
                    PhoneNumber = registerDto.PhoneNumber,
                    TcNumber = registerDto.TcNumber,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Admins.Add(admin);
                await _context.SaveChangesAsync();

                // Send email to branch manager
                if (!string.IsNullOrEmpty(registerDto.ManagerEmail))
                {
                    try
                    {
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

                        await _emailService.SendEmailAsync(registerDto.ManagerEmail, subject, body);
                    }
                    catch (Exception ex)
                    {
                        // Email sending failed, but admin registration was successful
                        // Log the error but don't fail the registration
                        Console.WriteLine($"Email sending failed: {ex.Message}");
                    }
                }

                return Ok(new { 
                    success = true, 
                    message = "Yönetici başarıyla kaydedildi!",
                    data = new { 
                        id = admin.Id,
                        fullName = admin.FullName,
                        firstName = admin.FirstName,
                        lastName = admin.LastName,
                        email = admin.Email,
                        phoneNumber = admin.PhoneNumber,
                        tcNumber = admin.TcNumber
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    success = false, 
                    message = "Kayıt işlemi sırasında hata oluştu!", 
                    error = ex.Message 
                });
            }
        }
    }
}