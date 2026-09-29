import styled from "styled-components";
import type { Task } from "@/types/task";
import type { Category } from "@/types/category";
import { type SubmitEvent } from "react";
import SubTaskList from "../SubTaskList/SubTaskList";

type TaskWithChildren = Task & {
    children: Task[];
};

type TaskListItemProps = {
    task: TaskWithChildren;
    category: Category | null;
    categoryVisible: boolean;
    onCheckboxChange: (id: number, newStatus: "open" | "done") => void;
    onTitleClick: (task: TaskWithChildren) => void;
    onSubmitSubTask: (
        event: SubmitEvent<HTMLFormElement>,
        parentTaskId: number,
    ) => void;
    onDelete: (id: number) => void;
    onUpdateSubTask: (event: SubmitEvent<HTMLFormElement>, id: number) => void;
};

export default function TaskListItem({
    task,
    category,
    categoryVisible,
    onCheckboxChange,
    onTitleClick,
    onSubmitSubTask,
    onDelete,
    onUpdateSubTask,
}: TaskListItemProps) {
    return (
        <ListItem>
            <TitleWrapper>
                <input
                    type="checkbox"
                    checked={task.status === "done"}
                    onChange={() =>
                        onCheckboxChange(
                            task.id,
                            task.status === "open" ? "done" : "open",
                        )
                    }
                    aria-label={`Mark ${task.title} as done`}
                />

                <button
                    onClick={() => {
                        onTitleClick(task);
                    }}
                >
                    {task.title}
                </button>
                {category && categoryVisible && (
                    <CategoryTag $color={category.color}>
                        {category.name}
                    </CategoryTag>
                )}
            </TitleWrapper>
            {task.children.length > 0 && (
                <StyledDetails>
                    <StyledSummary>Subtasks</StyledSummary>
                    <SubTaskList
                        subTasks={task.children}
                        onCheckboxChange={onCheckboxChange}
                        onSubmitSubTask={onSubmitSubTask}
                        parentTaskId={task.id}
                        onDelete={onDelete}
                        onUpdateSubTask={onUpdateSubTask}
                    />
                </StyledDetails>
            )}
        </ListItem>
    );
}

const ListItem = styled.li`
    font-size: 1rem;
    max-width: 600px;
`;

const TitleWrapper = styled.div`
    display: flex;

    > input {
        margin-right: 16px;

        &:hover {
            cursor: pointer;
        }
    }

    > button {
        background: none;
        border: none;
        font-size: 1rem;
        text-align: left;

        &:hover {
            cursor: pointer;
        }
    }
`;

const CategoryTag = styled.span<{ $color: string }>`
    display: flex;
    align-items: center;
    margin-left: auto;
    padding-right: 4px;
    padding-left: 16px;
    font-size: small;
    border-right: 5px solid ${({ $color }) => $color};
    border-radius: 4px;
`;

const StyledDetails = styled.details`
    margin-top: 8px;
`;

const StyledSummary = styled.summary`
    font-size: 0.9rem;
    padding-left: 28px;
`;
