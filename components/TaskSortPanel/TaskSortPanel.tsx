import type { JSX } from "react";
import { IoArrowDown, IoArrowUp } from "react-icons/io5";
import styled from "styled-components";
import {
    SORT_OPTIONS,
    isSortKey,
    type SortKey,
    type TaskSort,
} from "@/lib/taskView";

type TaskSortPanelProps = {
    sort: TaskSort;
    onChange: (sort: TaskSort) => void;
    availableKeys: SortKey[];
};

export default function TaskSortPanel({
    sort,
    onChange,
    availableKeys,
}: TaskSortPanelProps): JSX.Element {
    const isAscending = sort.direction === "asc";
    const directionLabel = isAscending ? "Ascending" : "Descending";

    return (
        <PanelWrapper>
            <label htmlFor="task-sort">Sort by</label>
            <StyledSelect
                id="task-sort"
                value={sort.key}
                onChange={(event) => {
                    const key = event.target.value;
                    if (isSortKey(key)) {
                        onChange({ ...sort, key });
                    }
                }}
            >
                {SORT_OPTIONS.filter((option) =>
                    availableKeys.includes(option.key),
                ).map((option) => (
                    <option key={option.key} value={option.key}>
                        {option.label}
                    </option>
                ))}
            </StyledSelect>
            <DirectionButton
                type="button"
                aria-label={directionLabel}
                title={directionLabel}
                onClick={() =>
                    onChange({
                        ...sort,
                        direction: isAscending ? "desc" : "asc",
                    })
                }
            >
                {isAscending ? <IoArrowUp /> : <IoArrowDown />}
            </DirectionButton>
        </PanelWrapper>
    );
}

const PanelWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    max-width: 600px;
    padding-left: 28px;
    margin-bottom: 32px;
    font-size: 0.9rem;

    @media screen and (max-width: 600px) {
        justify-content: flex-start;
    }
`;

const StyledSelect = styled.select`
    padding: 4px 8px;
    border-radius: 8px;
    border: 1px solid #bdbdbd;
    font-size: 0.9rem;
    color: var(--foreground);
    background: var(--background);
`;

const DirectionButton = styled.button`
    display: flex;
    align-items: center;
    background: none;
    border: none;
    color: var(--foreground);
    font-size: 1rem;
    padding: 4px;

    &:hover {
        cursor: pointer;
    }
`;
