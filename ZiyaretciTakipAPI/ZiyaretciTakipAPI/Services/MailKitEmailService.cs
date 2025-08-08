using System;
using Microsoft.Extensions.Configuration;
using MailKit.Net.Smtp;
using MimeKit;
using System.Threading.Tasks;

namespace ZiyaretciTakipAPI.Services
{
    public class MailKitEmailService
    {
        private readonly IConfiguration _configuration;

        public MailKitEmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                Console.WriteLine($"MailKit ile e-posta gönderiliyor: {toEmail}");
                
                // Önce Gmail ayarlarını dene, başarısız olursa alternatif ayarları dene
                string? fromEmail = null;
                string? password = null;
                string? host = null;
                int port = 0;
                
                try
                {
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

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("Ziyaretçi Takip Sistemi", fromEmail));
                message.To.Add(new MailboxAddress("", toEmail));
                message.Subject = subject;

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = body
                };

                message.Body = bodyBuilder.ToMessageBody();

                using (var client = new SmtpClient())
                {
                    // SSL sertifikası sorunlarını geçici olarak devre dışı bırak
                    client.ServerCertificateValidationCallback = (s, c, h, e) => true;
                    
                    Console.WriteLine($"SMTP sunucusuna bağlanılıyor: {host}:{port}");
                    // Gmail için STARTTLS kullanılmalı
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
                Console.WriteLine($"MailKit E-posta gönderiminde hata: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
                throw;
            }
        }
    }
}
