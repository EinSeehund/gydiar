import { useState } from "react";
import type { JSX, ReactNode, SubmitEvent } from "react";
import { format } from "date-fns";
import styled from "styled-components";
import type { Account } from "@/types/account";
import type { MutationResult } from "@/lib/hooks/useAccount";
import ButtonPrimary from "../ButtonPrimary/ButtonPrimary";

type SubmitHandler = (
    event: SubmitEvent<HTMLFormElement>,
) => Promise<MutationResult>;

type Props = {
    account: Account;
    onUpdateName: SubmitHandler;
    onChangeEmail: SubmitHandler;
    onChangePassword: SubmitHandler;
    onSetPassword: SubmitHandler;
};

const PROVIDER_LABELS: Record<string, string> = {
    google: "Google",
    github: "GitHub",
};

function providerLabel(provider: string): string {
    return PROVIDER_LABELS[provider] ?? provider;
}

export default function AccountDetails({
    account,
    onUpdateName,
    onChangeEmail,
    onChangePassword,
    onSetPassword,
}: Props): JSX.Element {
    const loginMethods = [
        ...(account.has_password ? ["Email & password"] : []),
        ...account.providers.map(providerLabel),
    ];
    const socialProviders = account.providers.map(providerLabel).join(" and ");

    return (
        <Section aria-labelledby="login-data-heading">
            <h3 id="login-data-heading">Login Data</h3>

            <Summary>
                <dt>Name</dt>
                <dd>{account.name}</dd>
                <dt>Email</dt>
                <dd>
                    {account.email}
                    {account.email_verified && <Badge>verified</Badge>}
                </dd>
                <dt>Login methods</dt>
                <dd>{loginMethods.join(", ")}</dd>
                <dt>Member since</dt>
                <dd>{format(new Date(account.created_at), "dd.MM.yy")}</dd>
            </Summary>

            {!account.has_password && (
                <InfoBox>
                    You sign in with {socialProviders}. Your email address is
                    managed there and can&apos;t be changed here.
                </InfoBox>
            )}

            <SettingsForm
                title="Change name"
                submitText="Save name"
                successText="Your name has been updated."
                onSubmit={onUpdateName}
            >
                <label htmlFor="settings-name">Name</label>
                <StyledInput
                    id="settings-name"
                    name="name"
                    type="text"
                    defaultValue={account.name}
                    autoComplete="name"
                    required
                />
            </SettingsForm>

            {account.has_password ? (
                <>
                    <SettingsForm
                        title="Change email"
                        submitText="Change email"
                        successText="Please confirm the change via the link we sent to your current email address."
                        onSubmit={onChangeEmail}
                    >
                        <label htmlFor="settings-email">New email</label>
                        <StyledInput
                            id="settings-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                        />
                    </SettingsForm>

                    <SettingsForm
                        title="Change password"
                        submitText="Change password"
                        successText="Your password has been changed. All other sessions have been signed out."
                        onSubmit={onChangePassword}
                    >
                        <label htmlFor="settings-current-password">
                            Current password
                        </label>
                        <StyledInput
                            id="settings-current-password"
                            name="currentPassword"
                            type="password"
                            autoComplete="current-password"
                            required
                        />
                        <label htmlFor="settings-new-password">
                            New password (min. 8 characters)
                        </label>
                        <StyledInput
                            id="settings-new-password"
                            name="newPassword"
                            type="password"
                            autoComplete="new-password"
                            minLength={8}
                            required
                        />
                    </SettingsForm>
                </>
            ) : (
                <SettingsForm
                    title="Set a password"
                    description="Set a password to also sign in with your email address and a password."
                    submitText="Set password"
                    successText="Your password has been set."
                    onSubmit={onSetPassword}
                >
                    <label htmlFor="settings-set-password">
                        Password (min. 8 characters)
                    </label>
                    <StyledInput
                        id="settings-set-password"
                        name="newPassword"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        required
                    />
                </SettingsForm>
            )}
        </Section>
    );
}

type SettingsFormProps = {
    title: string;
    description?: string;
    submitText: string;
    successText: string;
    onSubmit: SubmitHandler;
    children: ReactNode;
};

function SettingsForm({
    title,
    description,
    submitText,
    successText,
    onSubmit,
    children,
}: SettingsFormProps): JSX.Element {
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<{
        type: "error" | "success";
        text: string;
    } | null>(null);

    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>,
    ): Promise<void> {
        const form = event.currentTarget;
        setLoading(true);
        setMessage(null);
        const { error } = await onSubmit(event);
        setLoading(false);
        if (error) {
            setMessage({ type: "error", text: error });
            return;
        }
        setMessage({ type: "success", text: successText });
        form.querySelectorAll<HTMLInputElement>("input[type=password]").forEach(
            (input) => (input.value = ""),
        );
    }

    return (
        <StyledForm onSubmit={handleSubmit}>
            <h4>{title}</h4>
            {description && <p>{description}</p>}
            {children}
            <ButtonPrimary
                type="submit"
                text={loading ? "Please wait…" : submitText}
                disabled={loading}
            />
            {message && (
                <Message
                    role={message.type === "error" ? "alert" : "status"}
                    $type={message.type}
                >
                    {message.text}
                </Message>
            )}
        </StyledForm>
    );
}

const Section = styled.section`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const Summary = styled.dl`
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 8px 24px;

    dt {
        font-weight: bold;
    }

    dd {
        overflow-wrap: anywhere;
    }

    @media screen and (max-width: 600px) {
        grid-template-columns: 1fr;
        gap: 2px;

        dd {
            margin-bottom: 8px;
        }
    }
`;

const Badge = styled.span`
    margin-left: 8px;
    padding: 2px 6px;
    border: 1px solid var(--foreground);
    border-radius: 8px;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const InfoBox = styled.p`
    padding: 12px 16px;
    border: 1px dotted var(--foreground);
    border-radius: 8px;
`;

const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding-top: 16px;
    border-top: 1px dotted var(--foreground);

    label {
        font-size: 0.9rem;
    }
`;

const StyledInput = styled.input`
    width: 100%;
    max-width: 400px;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #bdbdbd;
    font-size: 1rem;
    font-family: inherit;
`;

const Message = styled.p<{ $type: "error" | "success" }>`
    font-size: 0.9rem;
    color: ${({ $type }) => ($type === "error" ? "#d80202" : "inherit")};
`;
