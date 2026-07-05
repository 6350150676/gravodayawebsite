import { Resend } from "resend";

export interface InquiryEmailData {
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  propertyTitle?: string | null;
  propertyUrl?: string | null;
  toEmail: string;
}

export async function sendInquiryNotification(data: InquiryEmailData) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const subject = data.propertyTitle
    ? `New Inquiry: ${data.propertyTitle}`
    : "New General Inquiry";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ef;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#1a2c5b;padding:28px 32px;">
            <p style="margin:0;color:#c9a84c;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;">Garvoday Developers</p>
            <h1 style="margin:8px 0 0;color:#ffffff;font-size:20px;font-weight:700;">New Property Inquiry</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            ${data.propertyTitle ? `
            <div style="background:#f5f3ef;border-left:3px solid #c9a84c;border-radius:4px;padding:14px 16px;margin-bottom:24px;">
              <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.1em;">Property</p>
              <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#1a2c5b;">${data.propertyTitle}</p>
              ${data.propertyUrl ? `<a href="${data.propertyUrl}" style="font-size:12px;color:#c9a84c;text-decoration:none;">View listing →</a>` : ""}
            </div>` : ""}

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0ede8;">
                  <p style="margin:0;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.1em;">Name</p>
                  <p style="margin:4px 0 0;font-size:15px;color:#1a1a1a;font-weight:600;">${data.name}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0ede8;">
                  <p style="margin:0;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.1em;">Phone</p>
                  <p style="margin:4px 0 0;font-size:15px;color:#1a1a1a;font-weight:600;">
                    <a href="tel:+91${data.phone}" style="color:#1a2c5b;text-decoration:none;">+91 ${data.phone}</a>
                  </p>
                </td>
              </tr>
              ${data.email ? `
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0ede8;">
                  <p style="margin:0;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.1em;">Email</p>
                  <p style="margin:4px 0 0;font-size:15px;color:#1a1a1a;font-weight:600;">
                    <a href="mailto:${data.email}" style="color:#1a2c5b;text-decoration:none;">${data.email}</a>
                  </p>
                </td>
              </tr>` : ""}
              ${data.message ? `
              <tr>
                <td style="padding:10px 0;">
                  <p style="margin:0;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.1em;">Message</p>
                  <p style="margin:4px 0 0;font-size:15px;color:#444;line-height:1.6;">${data.message.replace(/\n/g, "<br/>")}</p>
                </td>
              </tr>` : ""}
            </table>

            <div style="margin-top:28px;text-align:center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/admin/inquiries"
                 style="display:inline-block;background:#1a2c5b;color:#ffffff;font-size:13px;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;letter-spacing:0.05em;">
                View in Admin Panel →
              </a>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f5f3ef;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#aaa;">This is an automated notification from your Garvoday website.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await resend.emails.send({
    from: "Garvoday Website <onboarding@resend.dev>",
    to: data.toEmail,
    subject,
    html,
  });
}
