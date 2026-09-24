import styled from "styled-components";
import type { Task } from "@/types/task";
import SubTaskList from "../SubTaskList/SubTaskList";

type TaskWithChildren = Task & {
    children: Task[];
};

type TaskListItemProps = {
    task: TaskWithChildren;
    onCheckboxChange: (id: number, newStatus: "open" | "done") => void;
    onTitleClick: (task: Task) => void;
};

export default function TaskListItem({
    task,
    onCheckboxChange,
    onTitleClick,
}: TaskListItemProps) {
    return (
        <ListItem>
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
            {task.children.length > 0 && (
                <StyledDetails>
                    <StyledSummary>Subtasks</StyledSummary>
                    <SubTaskList
                        subTasks={task.children}
                        onCheckboxChange={onCheckboxChange}
                        onTitleClick={onTitleClick}
                    />
                </StyledDetails>
            )}
        </ListItem>
    );
}

const ListItem = styled.li`
    font-size: 1rem;

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

        &:hover {
            cursor: pointer;
        }
    }
`;

const StyledDetails = styled.details`
    margin-top: 8px;
`;

const StyledSummary = styled.summary`
    font-size: 0.9rem;
    padding-left: 32px;
`;
