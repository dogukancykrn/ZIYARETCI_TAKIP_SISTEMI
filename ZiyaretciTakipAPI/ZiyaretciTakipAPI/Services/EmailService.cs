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
            var fromEmail = _configuration["EmailSettings:Email"];
            var password = _configuration["EmailSettings:Password"];
            var host = _configuration["EmailSettings:Host"];
            var portString = _configuration["EmailSettings:Port"];
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
                EnableSsl = true
            };

            await smtpClient.SendMailAsync(mailMessage);
        }
    }
}
