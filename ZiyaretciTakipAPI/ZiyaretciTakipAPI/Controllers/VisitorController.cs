using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ZiyaretciTakipAPI.DTOs;
using ZiyaretciTakipAPI.Models;
using ZiyaretciTakipAPI.Data;
using ZiyaretciTakipAPI.Services;
using MailKit.Net.Smtp;
using MimeKit;

namespace ZiyaretciTakipAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VisitorController : ControllerBase
    {
        private readonly PostgreSqlDbContext _context;
        private readonly EmailService _emailService;
        private readonly MailKitEmailService _mailKitEmailService;
        private readonly IConfiguration _configuration;
        // private readonly RedisCacheService _cacheService;

        // Ensure only one constructor for DI
        public VisitorController(PostgreSqlDbContext context, EmailService emailService, MailKitEmailService mailKitEmailService, IConfiguration configuration)
        {
            _context = context;
            _emailService = emailService;
            _mailKitEmailService = mailKitEmailService;
            _configuration = configuration;
            // Redis cache service temporarily disabled
            // _cacheService = cacheService;
        }

        [HttpGet("test-email-direct")]
        public async Task<IActionResult> TestEmailDirect()
        {
            try
            {
                string? fromEmail = _configuration["EmailSettings:Email"];
                string? password = _configuration["EmailSettings:Password"];
                string? host = _configuration["EmailSettings:Host"];
                string? portString = _configuration["EmailSettings:Port"];

                if (string.IsNullOrEmpty(fromEmail) || string.IsNullOrEmpty(password) || 
                    string.IsNullOrEmpty(host) || string.IsNullOrEmpty(portString) || 
                    !int.TryParse(portString, out int port))
                {
                    return BadRequest(new { success = false, message = "Email settings are not properly configured" });
                }

                Console.WriteLine($"Doğrudan test e-postası gönderiliyor:");
                Console.WriteLine($"Kimden: {fromEmail}");
                Console.WriteLine($"Şifre: {password.Substring(0, 3)}****");
                Console.WriteLine($"Host: {host}");
                Console.WriteLine($"Port: {port}");

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("Ziyaretçi Takip Sistemi", fromEmail));
                message.To.Add(new MailboxAddress("", "dogukancykrn@gmail.com"));
                message.Subject = "Doğrudan Test E-Postası";
                
                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = "<h1>Bu bir test e-postasıdır</h1><p>E-posta servisi çalışıyor mu diye kontrol ediyoruz.</p>"
                };
                
                message.Body = bodyBuilder.ToMessageBody();

                using (var client = new SmtpClient())
                {
                    client.ServerCertificateValidationCallback = (s, c, h, e) => true;
                    
                    Console.WriteLine("SMTP sunucusuna bağlanılıyor...");
                    await client.ConnectAsync(host, port, MailKit.Security.SecureSocketOptions.StartTls);
                    
                    Console.WriteLine("SMTP sunucusuna giriş yapılıyor...");
                    await client.AuthenticateAsync(fromEmail, password);
                    
                    Console.WriteLine("E-posta gönderiliyor...");
                    await client.SendAsync(message);
                    
                    Console.WriteLine("E-posta gönderildi, bağlantı kapatılıyor...");
                    await client.DisconnectAsync(true);
                    
                    return Ok(new { success = true, message = "Test email sent successfully using direct MailKit implementation" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Doğrudan e-posta gönderiminde hata: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
                
                return BadRequest(new { 
                    success = false, 
                    message = ex.Message,
                    innerException = ex.InnerException?.Message
                });
            }
        }

        [HttpGet("test-email")]
        public async Task<IActionResult> TestEmail()
        {
            try
            {
                string subject = "Test Email from Ziyaretçi Takip API";
                string body = @"
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; color: #333; }
                        .container { padding: 20px; }
                        .header { background-color: #8B0000; color: white; padding: 10px; text-align: center; }
                        .content { padding: 20px; }
                        .footer { background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h2>Test Email</h2>
                        </div>
                        <div class='content'>
                            <p>This is a test email from the Ziyaretçi Takip API.</p>
                            <p>If you're receiving this, the email configuration is working correctly!</p>
                            <p>Time sent: " + DateTime.Now.ToString("dd.MM.yyyy HH:mm:ss") + @"</p>
                        </div>
                        <div class='footer'>
                            <p>© " + DateTime.Now.Year + @" Banka Ziyaretçi Takip Sistemi</p>
                        </div>
                    </div>
                </body>
                </html>";

                // First try with MailKit
                try
                {
                    await _mailKitEmailService.SendEmailAsync("dogukancykrn@gmail.com", subject, body);
                    return Ok(new { success = true, message = "Test email sent successfully using MailKit" });
                }
                catch (Exception mailKitEx)
                {
                    // If MailKit fails, try with System.Net.Mail
                    try
                    {
                        await _emailService.SendEmailAsync("dogukancykrn@gmail.com", subject, body);
                        return Ok(new { success = true, message = "Test email sent successfully using System.Net.Mail" });
                    }
                    catch (Exception netMailEx)
                    {
                        return BadRequest(new { 
                            success = false, 
                            message = "Both email services failed", 
                            mailKitError = mailKitEx.Message,
                            systemNetMailError = netMailEx.Message
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateVisitor([FromBody] VisitorCreateDto visitorDto)
        {
            var visitor = new Visitor
            {
                Id = Guid.NewGuid(),
                FullName = visitorDto.FullName, // İsmi doğal halinde kaydet
                TcNumber = visitorDto.TcNumber,
                VisitReason = visitorDto.VisitReason,
                EnteredAt = DateTime.UtcNow,
                ExitedAt = null
            };

            _context.Visitors.Add(visitor);
            await _context.SaveChangesAsync();

            // Her ziyaretçi kaydında dogukancykrn@gmail.com adresine bildirim gönder
            try
            {
                Console.WriteLine("Ziyaretçi e-posta bildirimi gönderiliyor (MailKit)...");
                
                string subject = "Yeni Ziyaretçi Kaydı";
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
                            <h2>Ziyaretçi Takip Sistemi - Yeni Ziyaretçi Bildirimi</h2>
                        </div>
                        <div class='content'>
                            <p>Yeni bir ziyaretçi kaydı yapılmıştır. Ziyaretçi bilgileri aşağıdadır:</p>
                            <p><b>Ad Soyad:</b> {visitor.FullName}</p>
                            <p><b>TC Kimlik No:</b> {visitor.TcNumber}</p>
                            <p><b>Ziyaret Nedeni:</b> {visitor.VisitReason}</p>
                            <p><b>Giriş Tarihi:</b> {visitor.EnteredAt.ToString("dd.MM.yyyy HH:mm:ss")}</p>
                            <p>Bu bir otomatik bilgilendirme mesajıdır.</p>
                        </div>
                        <div class='footer'>
                            <p>© {DateTime.Now.Year} Banka Ziyaretçi Takip Sistemi</p>
                        </div>
                    </div>
                </body>
                </html>";

                // İki farklı e-posta servisi deneyelim - biri başarısız olursa diğerini dene
                try
                {
                    await _mailKitEmailService.SendEmailAsync("dogukancykrn@gmail.com", subject, body);
                    Console.WriteLine("Ziyaretçi e-posta bildirimi başarıyla gönderildi (MailKit).");
                }
                catch (Exception mailKitEx)
                {
                    Console.WriteLine($"MailKit ile e-posta gönderimi başarısız: {mailKitEx.Message}");
                    Console.WriteLine("System.Net.Mail ile deneniyor...");
                    
                    await _emailService.SendEmailAsync("dogukancykrn@gmail.com", subject, body);
                    Console.WriteLine("Ziyaretçi e-posta bildirimi başarıyla gönderildi (System.Net.Mail).");
                }
            }
            catch (Exception ex)
            {
                // E-posta gönderimi başarısız olsa bile ziyaretçi kaydını etkilemesin
                Console.WriteLine($"Ziyaretçi bildirim e-postası gönderilirken hata oluştu: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
            }

            // Redis cache temporarily disabled
            // await _cacheService.RemoveAsync("active_visitors");

            return Ok(new { 
                success = true, 
                message = "Ziyaretçi başarıyla kaydedildi!", 
                data = visitor 
            });
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveVisitors()
        {
            // Redis cache temporarily disabled
            /*
            const string cacheKey = "active_visitors";
            var cachedVisitors = await _cacheService.GetAsync<List<Visitor>>(cacheKey);
            if (cachedVisitors != null)
            {
                return Ok(new
                {
                    success = true,
                    message = "Aktif ziyaretçiler cache üzerinden getirildi",
                    data = cachedVisitors
                });
            }
            */

            var activeVisitors = await _context.Visitors
                .Where(v => v.ExitedAt == null)
                .ToListAsync();

            // Redis cache temporarily disabled
            // await _cacheService.SetAsync("active_visitors", activeVisitors, TimeSpan.FromMinutes(5));

            return Ok(new
            {
                success = true,
                message = "Aktif ziyaretçiler veritabanından getirildi",
                data = activeVisitors
            });
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetVisitorHistory()
        {
            var visitors = await _context.Visitors.ToListAsync();
            return Ok(new { 
                success = true, 
                message = "Ziyaret geçmişi getirildi", 
                data = visitors 
            });
        }

        [HttpPatch("{tcNumber}/exit")]
        public async Task<IActionResult> ExitVisitor(string tcNumber)
        {
            var visitor = await _context.Visitors
                .FirstOrDefaultAsync(v => v.TcNumber == tcNumber && v.ExitedAt == null);
            
            if (visitor == null)
            {
                return NotFound(new { 
                    success = false, 
                    message = "Aktif ziyaretçi bulunamadı!" 
                });
            }

            visitor.ExitedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            
            // Redis cache temporarily disabled
            // await _cacheService.RemoveAsync("active_visitors");

            return Ok(new
            {
                success = true,
                message = "Ziyaretçi çıkışı kaydedildi!",
                data = visitor
            });
        }

        [HttpGet("{tcNumber}")]
        public async Task<IActionResult> GetVisitorByTcNumber(string tcNumber)
        {
            var visitor = await _context.Visitors
                .FirstOrDefaultAsync(v => v.TcNumber == tcNumber);
            
            if (visitor == null)
            {
                return NotFound(new { 
                    success = false, 
                    message = "Ziyaretçi bulunamadı!" 
                });
            }

            return Ok(new { 
                success = true, 
                data = visitor 
            });
        }

        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            var totalVisitors = await _context.Visitors.CountAsync();
            var activeVisitors = await _context.Visitors.CountAsync(v => v.ExitedAt == null);
            var todayVisitors = await _context.Visitors
                .CountAsync(v => v.EnteredAt.Date == DateTime.Today);
            var thisWeekVisitors = await _context.Visitors
                .CountAsync(v => v.EnteredAt >= DateTime.Today.AddDays(-7));
            
            var statistics = new {
                totalVisitors,
                activeVisitors,
                todayVisitors,
                thisWeekVisitors,
                avgVisitDurationHours = await CalculateAverageVisitDuration()
            };

            return Ok(new { 
                success = true, 
                message = "İstatistikler getirildi", 
                data = statistics 
            });
        }

        [HttpPost("filter")]
        public async Task<IActionResult> FilterVisitors([FromBody] VisitorFilterDto filter)
        {
            var query = _context.Visitors.AsQueryable();

            if (!string.IsNullOrEmpty(filter.FullName))
            {
                // PostgreSQL için case-insensitive arama (LOWER kullanarak)
                var searchName = filter.FullName.ToLower();
                query = query.Where(v => EF.Functions.Like(v.FullName.ToLower(), $"%{searchName}%"));
            }

            if (!string.IsNullOrEmpty(filter.TcNumber))
            {
                // TC numarası için partial match
                var searchTc = filter.TcNumber;
                query = query.Where(v => v.TcNumber.Contains(searchTc));
            }

            if (filter.StartDate.HasValue)
            {
                query = query.Where(v => v.EnteredAt >= filter.StartDate.Value);
            }

            if (filter.EndDate.HasValue)
            {
                query = query.Where(v => v.EnteredAt <= filter.EndDate.Value);
            }

            var visitors = await query.OrderByDescending(v => v.EnteredAt).ToListAsync();

            return Ok(new { 
                success = true, 
                message = "Filtrelenmiş ziyaretçiler getirildi", 
                data = visitors 
            });
        }

        private async Task<double> CalculateAverageVisitDuration()
        {
            var completedVisits = await _context.Visitors
                .Where(v => v.ExitedAt != null)
                .ToListAsync();

            if (!completedVisits.Any())
                return 0;

            var totalHours = completedVisits
                .Sum(v => (v.ExitedAt!.Value - v.EnteredAt).TotalHours);

            return totalHours / completedVisits.Count;
        }
    }
}
