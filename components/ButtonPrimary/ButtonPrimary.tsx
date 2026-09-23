import type { ButtonHTMLAttributes, JSX, MouseEventHandler } from "react";
import styled from "styled-components";

type ButtonPrimaryProps = {
    text: string;
    type: ButtonHTMLAttributes<HTMLButtonElement>["type"];
    onClick?: MouseEventHandler<HTMLButtonElement>;
};

export default function ButtonPrimary({
    text,
    type,
    onClick,
}: ButtonPrimaryProps): JSX.Element {
    return (
        <StyledButton type={type} onClick={onClick}>
            {text}
        </StyledButton>
    );
}

const StyledButton = styled.button`
    background-color: var(--foreground);
    color: var(--background);
    font-size: 1rem;
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
`;
