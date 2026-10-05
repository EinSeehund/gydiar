import { mutate } from "swr";
import { authClient } from "@/lib/auth-client";
import styled from "styled-components";

export default function LogoutButton() {
    async function handleLogout() {
        await authClient.signOut();
        // SWR-Cache leeren, damit der nächste Nutzer keine alten Tasks sieht
        await mutate(() => true, undefined, { revalidate: false });
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/login");
    }

    return <StyledButton onClick={handleLogout}>Logout</StyledButton>;
}

const StyledButton = styled.button`
    border: 1px solid var(--foreground);
    background: none;
    color: var(--foreground);
    font-size: 0.8rem;
    border-radius: 8px;
    display: block;
    line-height: 1;
    padding: 4px 8px;

    &:hover {
        cursor: pointer;
    }
`;
