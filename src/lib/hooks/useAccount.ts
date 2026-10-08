import useSWR from "swr";
import { SubmitEvent } from "react";
import { authClient } from "@/lib/auth-client";
import type { Account } from "@/types/account";

type AccountResponse = {
    success: boolean;
    account: Account;
};

export type MutationResult = {
    error?: string;
    code?: string;
};

const ERROR_MESSAGES: Record<string, string> = {
    INVALID_PASSWORD: "The password is incorrect.",
    PASSWORD_TOO_SHORT: "The password must be at least 8 characters long.",
    PASSWORD_TOO_LONG: "The password is too long.",
    SESSION_EXPIRED: "For security reasons, please sign in again.",
    CREDENTIAL_ACCOUNT_NOT_FOUND: "Your account has no password yet.",
    USER_ALREADY_HAS_PASSWORD: "Please enter your password.",
};

function toResult(
    error: { code?: string; message?: string } | null,
    fallback: string,
): MutationResult {
    if (!error) return {};
    return {
        error: (error.code && ERROR_MESSAGES[error.code]) || fallback,
        code: error.code,
    };
}

function readField(event: SubmitEvent<HTMLFormElement>, name: string): string {
    const value = new FormData(event.currentTarget).get(name);
    return typeof value === "string" ? value : "";
}

export function useAccount() {
    const { data, error, isLoading, mutate } =
        useSWR<AccountResponse>("/api/account");

    async function updateName(
        event: SubmitEvent<HTMLFormElement>,
    ): Promise<MutationResult> {
        event.preventDefault();
        const name = readField(event, "name").trim();
        if (!name) return { error: "Name is required." };

        const { error } = await authClient.updateUser({ name });
        if (!error) await mutate();
        return toResult(error, "Could not update your name.");
    }

    async function changeEmail(
        event: SubmitEvent<HTMLFormElement>,
    ): Promise<MutationResult> {
        event.preventDefault();
        const newEmail = readField(event, "email").trim();
        if (!newEmail) return { error: "Email is required." };

        const { error } = await authClient.changeEmail({
            newEmail,
            callbackURL: "/settings",
        });
        return toResult(error, "Could not change your email address.");
    }

    async function changePassword(
        event: SubmitEvent<HTMLFormElement>,
    ): Promise<MutationResult> {
        event.preventDefault();
        const { error } = await authClient.changePassword({
            currentPassword: readField(event, "currentPassword"),
            newPassword: readField(event, "newPassword"),
            revokeOtherSessions: true,
        });
        return toResult(error, "Could not change your password.");
    }

    async function setPassword(
        event: SubmitEvent<HTMLFormElement>,
    ): Promise<MutationResult> {
        event.preventDefault();
        const response = await fetch("/api/account/password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                newPassword: readField(event, "newPassword"),
            }),
        });
        if (!response.ok) {
            const body = await response.json().catch(() => null);
            return { error: body?.error ?? "Could not set your password." };
        }
        await mutate();
        return {};
    }

    async function deleteAccount(password?: string): Promise<MutationResult> {
        const { error } = await authClient.deleteUser(
            password ? { password } : {},
        );
        return toResult(error, "Could not delete your account.");
    }

    return {
        data,
        error,
        isLoading,
        mutate,
        updateName,
        changeEmail,
        changePassword,
        setPassword,
        deleteAccount,
    };
}
