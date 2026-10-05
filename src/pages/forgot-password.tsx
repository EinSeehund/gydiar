import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);
        await authClient.requestPasswordReset({
            email: String(formData.get("email")),
            redirectTo: "/reset-password",
        });
        setLoading(false);
        setSent(true);
    }

    if (sent) {
        return (
            <main>
                <p>Falls ein Konto mit dieser Adresse existiert, haben wir dir eine E-Mail geschickt.</p>
                <Link href="/login">Zurück zum Login</Link>
            </main>
        );
    }

    return (
        <main>
            <h1>Passwort vergessen</h1>
            <form onSubmit={handleSubmit}>
                <input name="email" type="email" placeholder="E-Mail" required />
                <button type="submit" disabled={loading}>
                    {loading ? "Bitte warten…" : "Link anfordern"}
                </button>
            </form>
            <Link href="/login">Zurück zum Login</Link>
        </main>
    );
}