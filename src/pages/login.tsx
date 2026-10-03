import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const { error } = await authClient.signIn.email({
            email: String(formData.get("email")),
            password: String(formData.get("password")),
        });

        setLoading(false);
        if (error) {
            setError(
                error.status === 403
                    ? "Bitte bestätige zuerst deine E-Mail-Adresse."
                    : (error.message ?? "Login fehlgeschlagen"),
            );
            return;
        }
        router.push("/");
    }

    return (
        <main>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <input name="email" type="email" placeholder="E-Mail" required />
                <input name="password" type="password" placeholder="Passwort" required />
                <button type="submit" disabled={loading}>
                    {loading ? "Bitte warten…" : "Einloggen"}
                </button>
                {error && <p role="alert">{error}</p>}
            </form>

            <button onClick={() => authClient.signIn.social({ provider: "github", callbackURL: "/" })}>
                Mit GitHub einloggen
            </button>
            <button onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/" })}>
                Mit Google einloggen
            </button>

            <p>Noch kein Konto? <Link href="/register">Registrieren</Link></p>
            <Link href="/forgot-password">Passwort vergessen?</Link>
        </main>
    );
}