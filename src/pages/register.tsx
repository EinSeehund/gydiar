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
        return (
            <>
                <Head>
                    <title>GYDIAR! - Sign up</title>
                    <meta
                        name="description"
                        content="Get Your Ducks In A Row!"
                    />
                    <link rel="icon" href="/favicon.png" />
                </Head>
                <p>
                    Fast geschafft! Wir haben dir eine E-Mail zur Bestätigung
                    geschickt.
                </p>
            </>
        );
    }

    return (
        <>
            <Head>
                <title>GYDIAR! - Sign up</title>
                <meta name="description" content="Get Your Ducks In A Row!" />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <StyledMain>
                <Wrapper>
                    <BigDuck>🦆</BigDuck>
                    <h1>Sign up</h1>
                    <StyledForm onSubmit={handleSubmit}>
                        <StyledInput name="name" placeholder="Name" required />
                        <StyledInput
                            name="email"
                            type="email"
                            placeholder="E-Mail"
                            required
                        />
                        <StyledInput
                            name="password"
                            type="password"
                            placeholder="Password (8 characters minimum)"
                            minLength={8}
                            required
                        />
                        <ButtonPrimary
                            type="submit"
                            disabled={loading}
                            text={loading ? "Please wait..." : "Sign up"}
                        />
                        {error && <p role="alert">{error}</p>}
                    </StyledForm>
                    <p>
                        Already have an account?{" "}
                        <Link href="/login"> Login here</Link>
                    </p>
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
