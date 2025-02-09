using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;

public class EmailService
{
    private readonly string smtpServer;
    private readonly int smtpPort;
    private readonly string smtpUser;
    private readonly string smtpPass;

    public EmailService(IConfiguration configuration)
    {
        smtpServer = configuration["EmailSettings:SmtpServer"];
        smtpPort = int.Parse(configuration["EmailSettings:SmtpPort"]);
        smtpUser = configuration["EmailSettings:SmtpUser"];
        smtpPass = configuration["EmailSettings:SmtpPass"];
    }

    public void SendEmail(string to, string subject, string body)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("Task Manager", smtpUser));
        message.To.Add(new MailboxAddress("", to));
        message.Subject = subject;
        message.Body = new TextPart("plain") { Text = body };

        using var client = new SmtpClient();
        client.Connect(smtpServer, smtpPort, false);
        client.Authenticate(smtpUser, smtpPass);
        client.Send(message);
        client.Disconnect(true);
    }
}
