import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "Gydiar <onboarding@resend.dev>";

let resend: Resend | null = null;

function getResend() {
    if (!resend) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) throw new Error("RESEND_API_KEY ist nicht gesetzt");
        resend = new Resend(apiKey);
    }
    return resend;
}

export async function sendEmail(to: string, subject: string, html: string) {
    const { error } = await getResend().emails.send({
        from: FROM,
        to,
        subject,
        html,
    });
    if (error) {
        console.error("E-Mail konnte nicht gesendet werden:", error);
        throw new Error("E-Mail-Versand fehlgeschlagen");
    }
}

export function actionEmail(
    heading: string,
    text: string,
    url: string,
    label: string,
) {
    return `
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2>${heading}</h2>
      <p>${text}</p>
      <p>
        <a href="${url}" style="display:inline-block;padding:12px 20px;background:#111;color:#fff;border-radius:6px;text-decoration:none">${label}</a>
      </p>
      <p style="color:#666;font-size:13px">Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br>${url}</p>
      <p style="color:#666;font-size:13px">Wenn du das nicht angefordert hast, kannst du diese E-Mail ignorieren.</p>
    </div>`;
}
