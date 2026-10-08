import type { NextPage } from "next";
import Head from "next/head";
import { JSX } from "react";
import styled from "styled-components";
import { useAccount } from "@/lib/hooks/useAccount";
import AccountDetails from "../../components/AccountDetails/AccountDetails";
import DeleteAccountSection from "../../components/DeleteAccountSection/DeleteAccountSection";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

const SettingsPage: NextPage = (): JSX.Element => {
    const {
        data,
        error,
        isLoading,
        updateName,
        changeEmail,
        changePassword,
        setPassword,
        deleteAccount,
    } = useAccount();

    if (isLoading) return <LoadingSpinner />;
    if (error || !data?.account) return <p>Failed to load account.</p>;

    const account = data.account;

    return (
        <>
            <Head>
                <title>GYDIAR! - Settings</title>
                <meta name="description" content="Get Your Ducks In A Row!" />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <main>
                <Container>
                    <StyledPageTitle>Settings</StyledPageTitle>
                    <AccountDetails
                        account={account}
                        onUpdateName={updateName}
                        onChangeEmail={changeEmail}
                        onChangePassword={changePassword}
                        onSetPassword={setPassword}
                    />
                    <DeleteAccountSection
                        account={account}
                        onDelete={deleteAccount}
                    />
                </Container>
            </main>
        </>
    );
};

export default SettingsPage;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 48px;
    max-width: 700px;
    padding: 30px 64px;

    @media screen and (max-width: 600px) {
        padding: 20px;
    }

    @media screen and (min-width: 601px) and (max-width: 992px) {
        padding: 30px 30px 30px 0;
    }
`;

const StyledPageTitle = styled.h2`
    margin-bottom: -16px;
`;
