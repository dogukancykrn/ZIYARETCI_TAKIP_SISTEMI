using Microsoft.AspNetCore.Mvc;
using ZiyaretciTakipAPI.Services;

namespace ZiyaretciTakipAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly EmailService _emailService;
        private readonly MailKitEmailService _mailKitEmailService;

        public TestController(EmailService emailService, MailKitEmailService mailKitEmailService)
        {
            _emailService = emailService;
            _mailKitEmailService = mailKitEmailService;
        }

        [HttpGet("send-test-email")]
        public async Task<IActionResult> SendTestEmail()
        {
            try
            {
                string subject = "Test E-postası (System.Net.Mail)";
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
                            <h2>Ziyaretçi Takip Sistemi - Test E-postası</h2>
                        </div>
                        <div class='content'>
                            <p>Bu bir test e-postasıdır. (System.Net.Mail)</p>
                            <p>E-posta gönderimi başarıyla çalışmaktadır.</p>
                            <p>Tarih/Saat: " + DateTime.Now.ToString("dd.MM.yyyy HH:mm:ss") + @"</p>
                        </div>
                        <div class='footer'>
                            <p>© " + DateTime.Now.Year + @" Banka Ziyaretçi Takip Sistemi</p>
                        </div>
                    </div>
                </body>
                </html>";

                await _emailService.SendEmailAsync("dogukancykrn@gmail.com", subject, body);

                return Ok(new { success = true, message = "Test e-postası başarıyla gönderildi! (System.Net.Mail)" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    success = false, 
                    message = "E-posta gönderilirken hata oluştu (System.Net.Mail)", 
                    error = ex.Message,
                    innerError = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
        
        [HttpGet("send-test-email-mailkit")]
        public async Task<IActionResult> SendTestEmailMailKit()
        {
            try
            {
                string subject = "Test E-postası (MailKit)";
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
                            <h2>Ziyaretçi Takip Sistemi - Test E-postası</h2>
                        </div>
                        <div class='content'>
                            <p>Bu bir test e-postasıdır. (MailKit)</p>
                            <p>E-posta gönderimi başarıyla çalışmaktadır.</p>
                            <p>Tarih/Saat: " + DateTime.Now.ToString("dd.MM.yyyy HH:mm:ss") + @"</p>
                        </div>
                        <div class='footer'>
                            <p>© " + DateTime.Now.Year + @" Banka Ziyaretçi Takip Sistemi</p>
                        </div>
                    </div>
                </body>
                </html>";

                await _mailKitEmailService.SendEmailAsync("dogukancykrn@gmail.com", subject, body);

                return Ok(new { success = true, message = "Test e-postası başarıyla gönderildi! (MailKit)" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    success = false, 
                    message = "E-posta gönderilirken hata oluştu (MailKit)", 
                    error = ex.Message,
                    innerError = ex.InnerException?.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
    }
}
