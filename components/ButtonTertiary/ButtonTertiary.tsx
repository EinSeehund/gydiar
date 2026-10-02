import type { ButtonHTMLAttributes, JSX, MouseEventHandler } from "react";
import { IoTrashOutline } from "react-icons/io5";
import styled from "styled-components";

type ButtonTertiaryProps = {
    text: string | null;
    type: ButtonHTMLAttributes<HTMLButtonElement>["type"];
    onClick?: MouseEventHandler<HTMLButtonElement>;
};

export default function ButtonTertiary({
    text,
    type,
    onClick,
}: ButtonTertiaryProps): JSX.Element {
    return (
        <StyledButton type={type} onClick={onClick} aria-label={text ?? "Delete"}>
            {text ?? (
                <TrashIcon>
                    <IoTrashOutline />
                </TrashIcon>
            )}
        </StyledButton>
    );
}

const StyledButton = styled.button`
    text-transform: uppercase;
    font-weight: bold;
    background: #d80202;
    color: var(--background);
    font-size: 0.8rem;
    letter-spacing: 1px;
    padding: 4px 8px;
    border: none;
    align-self: flex-end;
    border-radius: 8px;
    cursor: pointer;
`;

const TrashIcon = styled.div`
    padding-top: 4px;
    font-size: 1.2rem;
`;
