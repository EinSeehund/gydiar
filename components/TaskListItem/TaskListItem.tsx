import styled from "styled-components";
import type { Task } from "@/types/task";

type TaskListItemProps = {
    task: Task;
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
