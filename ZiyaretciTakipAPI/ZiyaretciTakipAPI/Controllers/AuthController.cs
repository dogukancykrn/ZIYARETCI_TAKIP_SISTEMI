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

        public AuthController(IJwtService jwtService, PostgreSqlDbContext context)
        {
            _jwtService = jwtService;
            _context = context;
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

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] AdminRegisterDto adminDto)
        {
            // Email kontrolü
            if (await _context.Admins.AnyAsync(a => a.Email == adminDto.Email))
            {
                return BadRequest(new { 
                    success = false, 
                    message = "Bu email adresi zaten kullanılıyor!" 
                });
            }

            var admin = new Admin
            {
                Id = Guid.NewGuid(),
                FullName = adminDto.FullName,
                Email = adminDto.Email,
                PhoneNumber = adminDto.PhoneNumber,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminDto.Password),
                Role = "Admin",
                CreatedAt = DateTime.UtcNow
            };

            _context.Admins.Add(admin);
            await _context.SaveChangesAsync();

            return Ok(new { 
                success = true, 
                message = "Admin başarıyla oluşturuldu!", 
                data = new { admin.Id, admin.FullName, admin.Email } 
            });
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
    }
}