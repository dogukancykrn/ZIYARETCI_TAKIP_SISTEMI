using System;
using System.Net;
using System.Net.Mail;

using Microsoft.Extensions.Configuration;

namespace ZiyaretciTakipAPI.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                // SSL Sertifikası doğrulama sorunlarını geçici olarak devre dışı bırak
                // NOT: Yalnızca geliştirme ortamında kullanın!
                System.Net.ServicePointManager.ServerCertificateValidationCallback = 
                    (sender, certificate, chain, sslPolicyErrors) => true;

                var fromEmail = _configuration["EmailSettings:Email"];
                var password = _configuration["EmailSettings:Password"];
                var host = _configuration["EmailSettings:Host"];
                var portString = _configuration["EmailSettings:Port"];
                
                Console.WriteLine($"E-posta gönderiliyor: Gönderen={fromEmail}, Alıcı={toEmail}, SMTP={host}:{portString}");
                
                if (string.IsNullOrWhiteSpace(portString))
                {
                    throw new ArgumentException("SMTP port is not configured.", nameof(portString));
                }
                var port = int.Parse(portString);

                if (string.IsNullOrWhiteSpace(fromEmail))
                {
                    throw new ArgumentException("Sender email address is not configured.", nameof(fromEmail));
                }

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };
                mailMessage.To.Add(toEmail);

                var smtpClient = new SmtpClient(host)
                {
                    Port = port,
                    Credentials = new NetworkCredential(fromEmail, password),
                    EnableSsl = true,
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    UseDefaultCredentials = false,
                    Timeout = 30000 // 30 saniye
                };

                Console.WriteLine("SMTP client ayarlandı, e-posta gönderiliyor...");
                await smtpClient.SendMailAsync(mailMessage);
                Console.WriteLine("E-posta başarıyla gönderildi!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"E-posta gönderiminde hata: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
                throw; // Hatayı yukarı fırlat
            }
        }
    }
}
