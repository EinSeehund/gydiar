import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { redirectIfAuthenticated } from "@/lib/session";
import styled from "styled-components";
import ButtonPrimary from "../../components/ButtonPrimary/ButtonPrimary";
import {
    GithubLoginButton,
    GoogleLoginButton,
} from "react-social-login-buttons";
import Head from "next/head";

export const getServerSideProps = redirectIfAuthenticated;

export default function LoginPage() {
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

        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/today");
    }

    return (
        <>
            <Head>
                <title>GYDIAR! - Get Your Ducks In A Row!</title>
                <meta name="description" content="Get Your Ducks In A Row!" />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <StyledMain>
                <Wrapper>
                    <BigDuck>🦆</BigDuck>
                    <h1>Login</h1>
                    <StyledForm onSubmit={handleSubmit}>
                        <StyledInput
                            name="email"
                            type="email"
                            placeholder="E-Mail"
                            required
                        />
                        <StyledInput
                            name="password"
                            type="password"
                            placeholder="Password"
                            required
                        />
                        <ButtonPrimary
                            text={loading ? "Please wait…" : "Login"}
                            type="submit"
                            onClick={() => {}}
                            disabled={loading}
                        />
                        {error && <p role="alert">{error}</p>}
                    </StyledForm>
                    <p>
                        Don&apos;t have an account?{" "}
                        <Link href="/register">Sign up</Link>
                    </p>
                    <Link href="/forgot-password">Forgot password?</Link>
                    <StyledHr />
                    <GithubLoginButton
                        onClick={() =>
                            authClient.signIn.social({
                                provider: "github",
                                callbackURL: "/",
                            })
                        }
                        style={{
                            padding: "4px 8px",
                            fontSize: "1rem",
                            display: "flex",
                            justifyContent: "center",
                            borderRadius: "8px",
                        }}
                    />
                    <GoogleLoginButton
                        onClick={() =>
                            authClient.signIn.social({
                                provider: "google",
                                callbackURL: "/",
                            })
                        }
                        style={{
                            padding: "4px 8px",
                            fontSize: "1rem",
                            display: "flex",
                            justifyContent: "center",
                            borderRadius: "8px",
                        }}
                    />
                </Wrapper>
            </StyledMain>
        </>
    );
}

const StyledMain = styled.main`
    width: 100vw;
    height: 100vh;
    display: flex;
    padding-left: 0;
    justify-content: center;
    align-items: center;
`;

const Wrapper = styled.section`
    width: 90%;
    max-width: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
`;

const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    margin: 16px 0;
`;

const StyledInput = styled.input`
    width: 100%;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #bdbdbd;
    font-size: 1rem;
    font-family: inherit;
`;

const StyledHr = styled.hr`
    width: 100%;
    border-top: dotted 1px;
    margin: 16px 0;
`;

const BigDuck = styled.p`
    font-size: 4rem;
`;
