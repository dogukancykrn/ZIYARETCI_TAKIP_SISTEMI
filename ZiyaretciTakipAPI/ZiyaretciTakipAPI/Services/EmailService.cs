using System;
using System.Net;
using System.Net.Mail;

using Microsoft.Extensions.Configuration;

namespace ZiyaretciTakipAPI.Services
{
    // E-posta gönderimi için System.Net.Mail tabanlı servis sınıfı
    // Email service class based on System.Net.Mail for sending emails
    public class EmailService
    {
        // Yapılandırma bilgilerini okumak için dependency injection
        // Dependency injection for reading configuration settings
        private readonly IConfiguration _configuration;

        // EmailService constructor'ı - yapılandırma bağımlılığını enjekte eder
        // EmailService constructor - injects configuration dependency
        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // E-posta gönderimi için asenkron metod
        // Asynchronous method for sending emails
        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                // SSL Sertifikası doğrulama sorunlarını geçici olarak devre dışı bırak
                // NOT: Yalnızca geliştirme ortamında kullanın!
                // Temporarily disable SSL certificate validation issues
                // NOTE: Use only in development environment!
                System.Net.ServicePointManager.ServerCertificateValidationCallback = 
                    (sender, certificate, chain, sslPolicyErrors) => true;

                // appsettings.json'dan e-posta yapılandırma bilgilerini al
                // Get email configuration information from appsettings.json
                var fromEmail = _configuration["EmailSettings:Email"];
                var password = _configuration["EmailSettings:Password"];
                var host = _configuration["EmailSettings:Host"];
                var portString = _configuration["EmailSettings:Port"];
                
                Console.WriteLine($"E-posta gönderiliyor: Gönderen={fromEmail}, Alıcı={toEmail}, SMTP={host}:{portString}");
                
                // Port yapılandırmasının geçerli olduğunu kontrol et
                // Verify that port configuration is valid
                if (string.IsNullOrWhiteSpace(portString))
                {
                    throw new ArgumentException("SMTP port is not configured.", nameof(portString));
                }
                var port = int.Parse(portString);

                // Gönderen e-posta adresinin yapılandırıldığını kontrol et
                // Verify that sender email address is configured
                if (string.IsNullOrWhiteSpace(fromEmail))
                {
                    throw new ArgumentException("Sender email address is not configured.", nameof(fromEmail));
                }

                // E-posta mesajını oluştur
                // Create the email message
                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true // HTML formatında e-posta gövdesi / HTML format email body
                };
                mailMessage.To.Add(toEmail);

                // SMTP client'ını yapılandır
                // Configure SMTP client
                var smtpClient = new SmtpClient(host)
                {
                    Port = port,
                    Credentials = new NetworkCredential(fromEmail, password),
                    EnableSsl = true, // SSL şifreleme etkin / SSL encryption enabled
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    UseDefaultCredentials = false,
                    Timeout = 30000 // 30 saniye timeout / 30 seconds timeout
                };

                Console.WriteLine("SMTP client ayarlandı, e-posta gönderiliyor...");
                await smtpClient.SendMailAsync(mailMessage);
                Console.WriteLine("E-posta başarıyla gönderildi!");
            }
            catch (Exception ex)
            {
                // Hata durumunda detaylı log kaydı
                // Detailed logging in case of error
                Console.WriteLine($"E-posta gönderiminde hata: {ex.Message}");
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
