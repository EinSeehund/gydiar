import { betterAuth } from "better-auth";
import pool from "./db";
import { sendEmail, actionEmail } from "./email";
import { deleteUserData } from "./account";

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

    user: {
        changeEmail: {
            enabled: true,
            sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
                await sendEmail(
                    user.email,
                    "Confirm your email change",
                    actionEmail(
                        "Change your email address",
                        `Click the button to change the email address of your Gydiar account to ${newEmail}. Afterwards we'll send a verification link to the new address.`,
                        url,
                        "Confirm change",
                        "en",
                    ),
                );
            },
        },
        deleteUser: {
            enabled: true,
            beforeDelete: async (user) => {
                await deleteUserData(user.id);
            },
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

    rateLimit: {
        enabled: true,
        window: 60,
        max: 100,
        storage: "database",
    },
});
