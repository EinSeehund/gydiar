import { useState } from "react";
import type { JSX } from "react";
import styled from "styled-components";
import type { Account } from "@/types/account";
import type { MutationResult } from "@/lib/hooks/useAccount";
import DeleteAccountModal, {
    DELETE_ACCOUNT_WARNING,
} from "../DeleteAccountModal/DeleteAccountModal";
import ButtonDanger from "../ButtonDanger/ButtonDanger";

type Props = {
    account: Account;
    onDelete: (password?: string) => Promise<MutationResult>;
};

export default function DeleteAccountSection({
    account,
    onDelete,
}: Props): JSX.Element {
    const [showModal, setShowModal] = useState<boolean>(false);

    return (
        <Section aria-labelledby="delete-account-heading">
            <h3 id="delete-account-heading">Delete Account</h3>
            <p>{DELETE_ACCOUNT_WARNING}</p>
            <ButtonDanger
                type="button"
                text="Delete account"
                onClick={() => setShowModal(true)}
            />
            {showModal && (
                <DeleteAccountModal
                    account={account}
                    onCancel={() => setShowModal(false)}
                    onConfirm={onDelete}
                />
            )}
        </Section>
    );
}

const Section = styled.section`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 24px;
    border: 2px solid #d80202;
    border-radius: 16px;

    h3 {
        color: #d80202;
    }

    @media screen and (max-width: 600px) {
        padding: 16px;
    }
`;

