import sgMail from "@sendgrid/mail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "no-reply@example.com";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  if (!SENDGRID_API_KEY) {
    console.log("SendGrid API key not set. Email content:", { to, subject, text, html });
    return;
  }

  await sgMail.send({
    to,
    from: SENDGRID_FROM_EMAIL,
    subject,
    text,
    html: html || text
  });
}

