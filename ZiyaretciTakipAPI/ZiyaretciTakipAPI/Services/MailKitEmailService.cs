using System;
using Microsoft.Extensions.Configuration;
using MailKit.Net.Smtp;
using MimeKit;
using System.Threading.Tasks;

namespace ZiyaretciTakipAPI.Services
{
    // MailKit kütüphanesi tabanlı gelişmiş e-posta gönderim servisi
    // Advanced email service based on MailKit library
    public class MailKitEmailService
    {
        // Yapılandırma bilgilerine erişim için dependency injection
        // Dependency injection for accessing configuration settings
        private readonly IConfiguration _configuration;

        // MailKitEmailService constructor'ı - yapılandırma bağımlılığını enjekte eder
        // MailKitEmailService constructor - injects configuration dependency
        public MailKitEmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // MailKit kullanarak e-posta gönderir (fallback mekanizması ile)
        // Sends email using MailKit (with fallback mechanism)
        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                Console.WriteLine($"MailKit ile e-posta gönderiliyor: {toEmail}");
                
                // Önce Gmail ayarlarını dene, başarısız olursa alternatif ayarları dene
                // Try Gmail settings first, then try alternative settings if it fails
                string? fromEmail = null;
                string? password = null;
                string? host = null;
                int port = 0;
                
                try
                {
                    // Ana e-posta yapılandırma ayarlarını al
                    // Get primary email configuration settings
                    fromEmail = _configuration["EmailSettings:Email"];
                    password = _configuration["EmailSettings:Password"];
                    host = _configuration["EmailSettings:Host"];
                    var portString = _configuration["EmailSettings:Port"];
                    if (string.IsNullOrWhiteSpace(portString))
                    {
                        throw new ArgumentException("SMTP port is not configured.");
                    }
                    port = int.Parse(portString);
                    
                    Console.WriteLine($"Gmail ayarları kullanılıyor: {host}:{port}");
                }
                catch (Exception)
                {
                    // Ana ayarlar başarısız, alternatif ayarları dene
                    // Primary settings failed, try alternative settings
                    Console.WriteLine("Gmail ayarları alınamadı veya hatalı, alternatif ayarlar deneniyor...");
                    
                    fromEmail = _configuration["AlternativeEmailSettings:Email"];
                    password = _configuration["AlternativeEmailSettings:Password"];
                    host = _configuration["AlternativeEmailSettings:Host"];
                    var altPortString = _configuration["AlternativeEmailSettings:Port"];
                    if (string.IsNullOrWhiteSpace(altPortString))
                    {
                        throw new ArgumentException("Alternatif SMTP port is not configured.");
                    }
                    port = int.Parse(altPortString);
                    
                    Console.WriteLine($"Alternatif ayarlar kullanılıyor: {host}:{port}");
                }

                // E-posta yapılandırma doğrulamaları
                // Email configuration validations
                if (string.IsNullOrWhiteSpace(fromEmail))
                {
                    throw new ArgumentException("Sender email address is not configured.");
                }
                
                if (string.IsNullOrWhiteSpace(password))
                {
                    throw new ArgumentException("Email password is not configured.");
                }
                
                if (string.IsNullOrWhiteSpace(host))
                {
                    throw new ArgumentException("SMTP host is not configured.");
                }

                // MIME mesaj nesnesi oluştur
                // Create MIME message object
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("Ziyaretçi Takip Sistemi", fromEmail)); // Gönderen / Sender
                message.To.Add(new MailboxAddress("", toEmail));                            // Alıcı / Recipient
                message.Subject = subject;                                                  // Konu / Subject

                // HTML formatında e-posta gövdesi oluştur
                // Create HTML format email body
                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = body
                };

                message.Body = bodyBuilder.ToMessageBody();

                // SMTP client kullanarak e-posta gönder
                // Send email using SMTP client
                using (var client = new SmtpClient())
                {
                    // SSL sertifikası sorunlarını geçici olarak devre dışı bırak (geliştirme için)
                    // Temporarily disable SSL certificate issues (for development)
                    client.ServerCertificateValidationCallback = (s, c, h, e) => true;
                    
                    Console.WriteLine($"SMTP sunucusuna bağlanılıyor: {host}:{port}");
                    // Gmail için STARTTLS kullanılmalı
                    // STARTTLS should be used for Gmail
                    await client.ConnectAsync(host, port, MailKit.Security.SecureSocketOptions.StartTls);
                    
                    Console.WriteLine("SMTP sunucusuna giriş yapılıyor");
                    await client.AuthenticateAsync(fromEmail, password);
                    
                    Console.WriteLine("E-posta gönderiliyor");
                    await client.SendAsync(message);
                    
                    Console.WriteLine("E-posta gönderildi, bağlantı kapatılıyor");
                    await client.DisconnectAsync(true);
                }
                
                Console.WriteLine("E-posta işlemi başarıyla tamamlandı");
            }
            catch (Exception ex)
            {
                // Hata durumunda detaylı log kaydı
                // Detailed logging in case of error
                Console.WriteLine($"MailKit E-posta gönderiminde hata: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
                throw; // Hatayı yukarı fırlat / Rethrow the exception
            }
        }
    }
}
