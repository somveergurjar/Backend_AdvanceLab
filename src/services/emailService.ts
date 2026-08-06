import nodemailer from "nodemailer";

// Sends real email via SMTP when configured; otherwise logs the message so
// the flow is still testable locally without mail server credentials.
export async function sendEmail(toEmail: string, subject: string, body: string): Promise<void> {
  const host = process.env.SMTP_HOST;

  if (!host) {
    console.warn(
      `SMTP is not configured (SMTP_HOST empty in .env). Email not sent.\nTo: ${toEmail}\nSubject: ${subject}\nBody:\n${body}`
    );
    return;
  }

  const transport = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? "587"),
    secure: process.env.SMTP_ENABLE_SSL === "true",
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transport.sendMail({
    from: process.env.SMTP_FROM_ADDRESS || process.env.SMTP_USERNAME,
    to: toEmail,
    subject,
    text: body,
  });
}
