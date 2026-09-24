import styled from "styled-components";
import type { Task } from "@/types/task";

type SubTaskListItemProps = {
    subTask: Task;
    onCheckboxChange: (id: number, newStatus: "open" | "done") => void;
    onTitleClick: (task: Task) => void;
};

export default function SubTaskListItem({
    subTask,
    onCheckboxChange,
    onTitleClick,
}: SubTaskListItemProps) {
    return (
        <SubListItem>
            <input
                type="checkbox"
                checked={subTask.status === "done"}
                onChange={() =>
                    onCheckboxChange(
                        subTask.id,
                        subTask.status === "open" ? "done" : "open",
                    )
                }
                aria-label={`Mark ${subTask.title} as done`}
            />

            <button
                onClick={() => {
                    onTitleClick(subTask);
                }}
            >
                {subTask.title}
            </button>
        </SubListItem>
    );
}

const SubListItem = styled.li`
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
