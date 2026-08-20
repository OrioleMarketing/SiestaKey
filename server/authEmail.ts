import { sendGhlEmail } from "./ghl";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

export async function sendMagicLinkEmail(input: {
  email: string;
  name?: string | null;
  magicLinkUrl: string;
}) {
  const safeName = escapeHtml(input.name?.trim() || "there");
  const safeUrl = escapeHtml(input.magicLinkUrl);
  const htmlBody = `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f4f7f8;color:#18323b;font-family:Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 12px;background:#f4f7f8;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #d9e3e6;border-radius:14px;overflow:hidden;">
          <tr><td style="padding:26px 32px;background:#123f4a;color:#ffffff;">
            <div style="font-size:24px;font-weight:700;">Shop in Siesta Key</div>
            <div style="margin-top:5px;color:#9dd7df;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Local directory member access</div>
          </td></tr>
          <tr><td style="padding:34px 32px;">
            <h1 style="margin:0 0 16px;font-size:26px;line-height:1.2;color:#123f4a;">Your secure sign-in link</h1>
            <p style="margin:0 0 18px;font-size:15px;line-height:1.65;">Hello ${safeName},</p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.65;">Use the button below to sign in to your Shop in Siesta Key account. This link expires in 15 minutes and can be used only once.</p>
            <p style="margin:0 0 24px;"><a href="${safeUrl}" style="display:inline-block;padding:13px 19px;border-radius:8px;background:#e6a72f;color:#18323b;text-decoration:none;font-weight:700;">Sign in securely</a></p>
            <p style="margin:0;font-size:13px;line-height:1.55;color:#667a80;">If you did not request this email, you can safely ignore it. Your password has not been changed.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return sendGhlEmail({
    toEmail: input.email,
    toName: input.name,
    subject: "Your Shop in Siesta Key sign-in link",
    htmlBody,
  });
}
