import type { ButtonHTMLAttributes, JSX, MouseEventHandler } from "react";
import styled from "styled-components";

type ButtonSecondaryProps = {
    text: string;
    type: ButtonHTMLAttributes<HTMLButtonElement>["type"];
    onClick?: MouseEventHandler<HTMLButtonElement>;
    className?: string;
};

export default function ButtonSecondary({
    text,
    type,
    onClick,
    className
}: ButtonSecondaryProps): JSX.Element {
    return <StyledButton className={className} type={type} onClick={onClick}>{text}</StyledButton>;
}

const StyledButton = styled.button`
    background: none;
    color: var(--foreground);
    font-size: 1rem;
    margin: 8px 16px;
    border: none;
`;
