import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Ohne eigene Domain, hier später ändern
const FROM = "Gydiar <onboarding@resend.dev>";

export async function sendEmail(to: string, subject: string, html: string) {
  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) {
    console.error("E-Mail konnte nicht gesendet werden:", error);
    throw new Error("E-Mail-Versand fehlgeschlagen");
  }
}