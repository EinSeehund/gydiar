import type { ButtonHTMLAttributes, JSX, MouseEventHandler } from "react";
import styled from "styled-components";

type ButtonDangerProps = {
    text: string;
    type: ButtonHTMLAttributes<HTMLButtonElement>["type"];
    onClick?: MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
};

export default function ButtonDanger({
    text,
    type,
    onClick,
    disabled,
}: ButtonDangerProps): JSX.Element {
    return (
        <StyledButton type={type} onClick={onClick} disabled={disabled}>
            {text}
        </StyledButton>
    );
}

const StyledButton = styled.button`
    background-color: #d80202;
    color: #ffffff;
    font-size: 1rem;
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    cursor: pointer;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;
