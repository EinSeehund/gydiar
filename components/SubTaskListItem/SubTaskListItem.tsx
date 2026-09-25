import styled from "styled-components";
import type { Task } from "@/types/task";
import { type SubmitEvent } from "react";
import { useState } from "react";
import SubTaskForm from "../SubTaskForm/SubTaskForm";

type SubTaskListItemProps = {
    subTask: Task;
    parentTaskId: number;
    onCheckboxChange: (id: number, newStatus: "open" | "done") => void;
    onDelete: (id: number) => void;
    onUpdateSubTask: (event: SubmitEvent<HTMLFormElement>, id: number) => void;
};

export default function SubTaskListItem({
    subTask,
    parentTaskId,
    onCheckboxChange,
    onDelete,
    onUpdateSubTask,
}: SubTaskListItemProps) {
    const [showUpdateForm, setShowUpdateForm] = useState<boolean>(false);

    function toggleUpdateForm() {
        setShowUpdateForm(!showUpdateForm);
    }

    function handleUpdateSubTask(
        event: SubmitEvent<HTMLFormElement>,
        subTaskId: number,
    ) {
        onUpdateSubTask(event, subTaskId);
        setShowUpdateForm(false);
    }

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

            {!showUpdateForm && (
                <button onClick={toggleUpdateForm}>{subTask.title}</button>
            )}
            {showUpdateForm && (
                <SubTaskForm
                    task={subTask}
                    parentTaskId={parentTaskId}
                    isEditing={true}
                    onSubmit={(event) => handleUpdateSubTask(event, subTask.id)}
                    onCancel={toggleUpdateForm}
                    onDelete={onDelete}
                />
            )}
        </SubListItem>
    );
}

const SubListItem = styled.li`
    font-size: 1rem;
    display: flex;
    justify-content: flex-start;
    align-items: baseline;

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
