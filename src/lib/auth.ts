import { betterAuth } from "better-auth";
import pool from "./db";
import { sendEmail, actionEmail } from "./email";

export const auth = betterAuth({
    database: pool,

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        revokeSessionsOnPasswordReset: true,
        sendResetPassword: async ({ user, url }) => {
            await sendEmail(
                user.email,
                "Passwort zurücksetzen",
                actionEmail(
                    "Passwort zurücksetzen",
                    "Klicke auf den Button, um ein neues Passwort zu vergeben. Der Link ist eine Stunde gültig.",
                    url,
                    "Neues Passwort festlegen",
                ),
            );
        },
    },

    emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            await sendEmail(
                user.email,
                "E-Mail-Adresse bestätigen",
                actionEmail(
                    "Willkommen bei Gydiar!",
                    "Bitte bestätige deine E-Mail-Adresse, um loszulegen.",
                    url,
                    "E-Mail bestätigen",
                ),
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
