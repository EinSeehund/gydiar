import { betterAuth } from "better-auth";
import pool from "./db";
import { sendEmail } from "./email";

export const auth = betterAuth({
  database: pool,

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail(
        user.email,
        "Passwort zurücksetzen",
        `<p>Klicke auf den Link, um dein Passwort zurückzusetzen:</p>
         <p><a href="${url}">Passwort zurücksetzen</a></p>`,
      );
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail(
        user.email,
        "E-Mail-Adresse bestätigen",
        `<p>Willkommen bei Gydiar!</p>
         <p><a href="${url}">E-Mail-Adresse bestätigen</a></p>`,
      );
    },
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});