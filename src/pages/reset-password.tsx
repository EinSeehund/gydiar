import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    if (!router.isReady) return null;

    const token = typeof router.query.token === "string" ? router.query.token : null;

    if (!token || router.query.error) {
        return (
            <main>
                <p>Dieser Link ist ungültig oder abgelaufen.</p>
                <Link href="/forgot-password">Neuen Link anfordern</Link>
            </main>
        );
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setLoading(true);
        const formData = new FormData(event.currentTarget);
        const { error } = await authClient.resetPassword({
            newPassword: String(formData.get("password")),
            token: token!,
        });
        setLoading(false);
        if (error) {
            setError(error.message ?? "Zurücksetzen fehlgeschlagen");
            return;
        }
        router.push("/login");
    }

    return (
        <main>
            <h1>Neues Passwort</h1>
            <form onSubmit={handleSubmit}>
                <input name="password" type="password" placeholder="Neues Passwort (min. 8 Zeichen)" minLength={8} required />
                <button type="submit" disabled={loading}>
                    {loading ? "Bitte warten…" : "Passwort speichern"}
                </button>
                {error && <p role="alert">{error}</p>}
            </form>
        </main>
    );
}