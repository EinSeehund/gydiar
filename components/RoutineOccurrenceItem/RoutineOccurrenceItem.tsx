import styled from "styled-components";
import { isToday, isTomorrow } from "date-fns";
import { IoRepeat } from "react-icons/io5";
import type { RoutineOccurrence } from "@/types/routine";
import type { Category } from "@/types/category";
import { formatDueDate, isOverdue } from "@/lib/dates";
import {
    CategoryTag,
    DueDate,
    ListItem,
    TitleAndProject,
    TitleWrapper,
} from "../TaskListItem/TaskListItem";

type Props = {
    occurrence: RoutineOccurrence;
    category: Category | null;
    categoryVisible: boolean;
    onCheckboxChange: (routineId: number, date: string, done: boolean) => void;
    onTitleClick: (routineId: number) => void;
};

export default function RoutineOccurrenceItem({
    occurrence,
    category,
    categoryVisible,
    onCheckboxChange,
    onTitleClick,
}: Props) {
    const { routine_id, title, due_date, status } = occurrence;
    const overdue = isOverdue(due_date, status);

    return (
        <ListItem>
            <TitleWrapper>
                <input
                    type="checkbox"
                    checked={status === "done"}
                    onChange={() =>
                        onCheckboxChange(routine_id, due_date, status !== "done")
                    }
                    aria-label={`Mark ${title} as done`}
                />
                <TitleAndProject>
                    <TitleButton onClick={() => onTitleClick(routine_id)}>
                        {title}
                        <IoRepeat aria-label="Routine" role="img" />
                    </TitleButton>
                </TitleAndProject>
                {category && categoryVisible && (
                    <CategoryTag $color={category.color}>
                        {category.name}
                    </CategoryTag>
                )}
            </TitleWrapper>
            <DueDate $dueToday={isToday(due_date)} $overdue={overdue}>
                {formatDueDate(due_date)}
                {isToday(due_date) && " (Today)"}
                {isTomorrow(due_date) && " (Tomorrow)"}
                {overdue && " (Overdue)"}
                {status === "missed" && " (Missed)"}
            </DueDate>
        </ListItem>
    );
}

const TitleButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 6px;

    svg {
        flex-shrink: 0;
        opacity: 0.6;
    }
`;
