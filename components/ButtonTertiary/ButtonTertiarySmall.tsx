import type { ButtonHTMLAttributes, JSX, MouseEventHandler } from "react";
import styled from "styled-components";

type ButtonTertiaryProps = {
    text: string;
    type: ButtonHTMLAttributes<HTMLButtonElement>["type"];
    onClick?: MouseEventHandler<HTMLButtonElement>;
};

export default function ButtonTertiarySmall({
    text,
    type,
    onClick,
}: ButtonTertiaryProps): JSX.Element {
    return (
        <StyledButton type={type} onClick={onClick}>
            {text}
        </StyledButton>
    );
}

const StyledButton = styled.button`
    text-transform: uppercase;
    font-weight: bold;
    background: #d80202;
    color: var(--background);
    font-size: 0.6rem;
    letter-spacing: 1px;
    padding: 4px 8px;
    border: none;
    align-self: flex-end;
    border-radius: 8px;
`;
