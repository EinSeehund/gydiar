import { useState } from "react";
import type { JSX, SubmitEvent } from "react";
import { mutate } from "swr";
import styled from "styled-components";
import { authClient } from "@/lib/auth-client";
import type { Account } from "@/types/account";
import type { MutationResult } from "@/lib/hooks/useAccount";
import Modal from "../Modal/Modal";
import ButtonSecondary from "../ButtonSecondary/ButtonSecondary";
import ButtonDanger from "../ButtonDanger/ButtonDanger";

export const DELETE_ACCOUNT_WARNING =
    "Deleting your account is permanent. All your tasks, categories and projects will be deleted forever and cannot be restored.";

type Props = {
    account: Account;
    onCancel: () => void;
    onConfirm: (password?: string) => Promise<MutationResult>;
};

export default function DeleteAccountModal({
    account,
    onCancel,
    onConfirm,
}: Props): JSX.Element {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [needsReauth, setNeedsReauth] = useState<boolean>(false);

    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>,
    ): Promise<void> {
        event.preventDefault();
        const password = new FormData(event.currentTarget).get("password");
        setLoading(true);
        setError(null);
        const result = await onConfirm(
            typeof password === "string" ? password : undefined,
        );
        if (result.error) {
            setLoading(false);
            setError(result.error);
            setNeedsReauth(result.code === "SESSION_EXPIRED");
            return;
        }
        await mutate(() => true, undefined, { revalidate: false });
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/login");
    }

    async function handleReauth(): Promise<void> {
        const provider = account.providers[0];
        if (!provider) return;
        await authClient.signIn.social({ provider, callbackURL: "/settings" });
    }

    return (
        <Modal>
            <StyledForm
                onSubmit={handleSubmit}
                aria-labelledby="delete-modal-heading"
            >
                <h2 id="delete-modal-heading">Delete account?</h2>
                <Warning>{DELETE_ACCOUNT_WARNING}</Warning>
                {account.has_password && (
                    <>
                        <label htmlFor="delete-password">
                            Enter your password to confirm
                        </label>
                        <StyledInput
                            id="delete-password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            autoFocus
                        />
                    </>
                )}
                {error && <ErrorText role="alert">{error}</ErrorText>}
                {needsReauth && account.providers.length > 0 && (
                    <ButtonSecondary
                        type="button"
                        text="Sign in again"
                        onClick={handleReauth}
                    />
                )}
                <Buttons>
                    <ButtonSecondary
                        type="button"
                        text="Cancel"
                        onClick={onCancel}
                    />
                    <ButtonDanger
                        type="submit"
                        text={loading ? "Deleting…" : "Delete forever"}
                        disabled={loading}
                    />
                </Buttons>
            </StyledForm>
        </Modal>
    );
}

const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 12px;

    label {
        font-size: 0.9rem;
    }
`;

const Warning = styled.p`
    font-weight: bold;
`;

const StyledInput = styled.input`
    width: 100%;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #bdbdbd;
    font-size: 1rem;
    font-family: inherit;
`;

const ErrorText = styled.p`
    color: #d80202;
    font-size: 0.9rem;
`;

const Buttons = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
`;
