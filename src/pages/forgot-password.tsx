import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { redirectIfAuthenticated } from "@/lib/session";
import styled from "styled-components";
import ButtonPrimary from "../../components/ButtonPrimary/ButtonPrimary";

export const getServerSideProps = redirectIfAuthenticated;

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
            <StyledMain>
                <Wrapper>
                    <BigDuck>🦆</BigDuck>
                    <p>
                        If there is an account associated with this email address a reset link has been sent.
                    </p>
                    <Link href="/login">Back to login page</Link>
                </Wrapper>
            </StyledMain>
        );
    }

    return (
        <StyledMain>
            <Wrapper>
                <BigDuck>🦆</BigDuck>
                <h1>Passwort vergessen</h1>
                <StyledForm onSubmit={handleSubmit}>
                    <StyledInput
                        name="email"
                        type="email"
                        placeholder="E-Mail"
                        required
                    />
                    <ButtonPrimary
                        type="submit"
                        text={loading ? "Please wait…" : "Request link"}
                        disabled={loading}
                    />
                </StyledForm>
                <Link href="/login">Zurück zum Login</Link>
            </Wrapper>
        </StyledMain>
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

    h1 {
        text-align: center;
    }
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

const BigDuck = styled.p`
    font-size: 4rem;
`;