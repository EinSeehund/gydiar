import Link from "next/link";
import { useRouter } from "next/router";
import { MdOutlineSettings } from "react-icons/md";
import styled from "styled-components";

type Props = {
    onClick?: () => void;
};

export default function SettingsLink({ onClick }: Props) {
    const { asPath } = useRouter();

    return (
        <StyledLink
            href="/settings"
            aria-label="Settings"
            aria-current={asPath === "/settings" ? "page" : undefined}
            onClick={onClick}
        >
            <MdOutlineSettings />
        </StyledLink>
    );
}

const StyledLink = styled(Link)`
    display: flex;
    align-items: center;
    background: none;
    border: none;
    padding: 0;
    font-size: 1.2rem;
    line-height: 0;
    color: var(--foreground);
    cursor: pointer;
`;
