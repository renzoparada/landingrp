import { Resend } from "resend";

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
}

let resendClient: Resend | null = null;
function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) resendClient = new Resend(apiKey);
  return resendClient;
}

/**
 * Sends transactional email. Falls back to logging to the console when no
 * RESEND_API_KEY is configured, so the whole funnel is testable locally
 * without an email provider.
 */
export async function sendEmail({ to, subject, html }: SendEmailArgs) {
  const client = getResend();
  const from = process.env.EMAIL_FROM || "Landing <onboarding@resend.dev>";

  if (!client) {
    console.log("──────── [email:dev-mode] ────────");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    console.log("───────────────────────────────────");
    return { ok: true, dev: true };
  }

  try {
    await client.emails.send({ from, to, subject, html });
    return { ok: true, dev: false };
  } catch (error) {
    console.error("Error enviando email:", error);
    return { ok: false, dev: false };
  }
}

export function verificationEmailTemplate(opts: {
  fullName: string;
  verifyUrl: string;
  brandName: string;
  primaryColor: string;
}) {
  const { fullName, verifyUrl, brandName, primaryColor } = opts;
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
    <h1 style="color:${primaryColor};font-size:20px;">¡Hola ${fullName}!</h1>
    <p style="color:#333;font-size:15px;line-height:1.6;">
      Gracias por completar tu perfil en <strong>${brandName}</strong>.
      Confirma tu correo para activar tu registro y poder agendar tu entrevista:
    </p>
    <p style="text-align:center;margin:28px 0;">
      <a href="${verifyUrl}" style="background:${primaryColor};color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
        Confirmar mi correo
      </a>
    </p>
    <p style="color:#888;font-size:12px;">
      Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
      <a href="${verifyUrl}">${verifyUrl}</a>
    </p>
  </div>`;
}

export function bookingConfirmationTemplate(opts: {
  fullName: string;
  brandName: string;
  primaryColor: string;
  dateLabel: string;
  timeLabel: string;
  timezone: string;
}) {
  const { fullName, brandName, primaryColor, dateLabel, timeLabel, timezone } =
    opts;
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
    <h1 style="color:${primaryColor};font-size:20px;">¡Cita confirmada, ${fullName}!</h1>
    <p style="color:#333;font-size:15px;line-height:1.6;">
      Tu entrevista con <strong>${brandName}</strong> quedó agendada para:
    </p>
    <p style="background:#f5f3ff;border-radius:8px;padding:16px;text-align:center;font-size:16px;font-weight:bold;color:${primaryColor};">
      ${dateLabel} · ${timeLabel} (${timezone})
    </p>
    <p style="color:#666;font-size:14px;">
      Te contactaremos con el enlace de la videollamada antes de la hora agendada.
    </p>
  </div>`;
}
