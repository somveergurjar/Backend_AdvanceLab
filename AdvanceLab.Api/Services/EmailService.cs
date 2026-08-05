using System.Net;
using System.Net.Mail;

namespace AdvanceLab.Api.Services;

// Sends real email via SMTP when configured; otherwise logs the message so
// the flow is still testable locally without mail server credentials.
public class EmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendAsync(string toEmail, string subject, string body)
    {
        var smtp = _config.GetSection("Smtp");
        var host = smtp["Host"];

        if (string.IsNullOrWhiteSpace(host))
        {
            _logger.LogWarning(
                "SMTP is not configured (Smtp:Host empty in appsettings.json). Email not sent.\nTo: {To}\nSubject: {Subject}\nBody:\n{Body}",
                toEmail, subject, body);
            return;
        }

        using var client = new SmtpClient(host, int.Parse(smtp["Port"] ?? "587"))
        {
            EnableSsl = bool.Parse(smtp["EnableSsl"] ?? "true"),
            Credentials = new NetworkCredential(smtp["Username"], smtp["Password"])
        };

        using var message = new MailMessage(smtp["FromAddress"] ?? smtp["Username"]!, toEmail, subject, body);
        await client.SendMailAsync(message);
    }
}
