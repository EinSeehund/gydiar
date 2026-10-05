import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const { error } = await authClient.signUp.email({
            name: String(formData.get("name")),
            email: String(formData.get("email")),
            password: String(formData.get("password")),
            callbackURL: "/",
        });

        setLoading(false);
        if (error) {
            setError(error.message ?? "Registrierung fehlgeschlagen");
            return;
        }
        setSent(true);
    }

    if (sent) {
        return <p>Fast geschafft! Wir haben dir eine E-Mail zur Bestätigung geschickt.</p>;
    }

    return (
        <main>
            <h1>Registrieren</h1>
            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Name" required />
                <input name="email" type="email" placeholder="E-Mail" required />
                <input name="password" type="password" placeholder="Passwort (min. 8 Zeichen)" minLength={8} required />
                <button type="submit" disabled={loading}>
                    {loading ? "Bitte warten…" : "Konto erstellen"}
                </button>
                {error && <p role="alert">{error}</p>}
            </form>

            <button onClick={() => authClient.signIn.social({ provider: "github", callbackURL: "/" })}>
                Mit GitHub fortfahren
            </button>
            <button onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/" })}>
                Mit Google fortfahren
            </button>

            <p>Schon ein Konto? <Link href="/login">Zum Login</Link></p>
        </main>
    );
}