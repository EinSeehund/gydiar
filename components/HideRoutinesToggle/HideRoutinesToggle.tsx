import type { JSX } from "react";
import styled from "styled-components";

type Props = {
    hidden: boolean;
    hiddenCount: number;
    onChange: (hidden: boolean) => void;
};

// Shared by TaskSortPanel and the calendar so the wording stays the same.
export default function HideRoutinesToggle({
    hidden,
    hiddenCount,
    onChange,
}: Props): JSX.Element {
    return (
        <ToggleButton type="button" onClick={() => onChange(!hidden)}>
            {hidden ? `Show routines (${hiddenCount} hidden)` : "Hide routines"}
        </ToggleButton>
    );
}

const ToggleButton = styled.button`
    background: none;
    border: none;
    padding: 0;
    color: var(--foreground);
    font-size: 0.9rem;
    text-decoration: underline;

    &:hover {
        cursor: pointer;
    }
`;
