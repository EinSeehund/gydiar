import styled from "styled-components";
import type { Task } from "@/types/task";
import { type SubmitEvent } from "react";
import SubTaskListItem from "../SubTaskListItem/SubTaskListItem";
import ButtonSecondary from "../ButtonSecondary/ButtonSecondary";
import { useState } from "react";
import SubTaskForm from "../SubTaskForm/SubTaskForm";

type SubTaskListProps = {
    subTasks: Task[];
    parentTaskId: number;
    onCheckboxChange: (id: number, newStatus: "open" | "done") => void;
    onSubmitSubTask: (
        event: SubmitEvent<HTMLFormElement>,
        parentTaskId: number,
    ) => void;
    onDelete: (id: number) => void;
    onUpdateSubTask: (event: SubmitEvent<HTMLFormElement>, id: number) => void;
};

export default function SubTaskList({
    subTasks,
    parentTaskId,
    onCheckboxChange,
    onSubmitSubTask,
    onDelete,
    onUpdateSubTask
}: SubTaskListProps) {
    const [showSubTaskForm, setShowSubTaskForm] = useState<boolean>(false);

    function toggleSubTaskForm() {
        setShowSubTaskForm(!showSubTaskForm);
    }

    return (
        <>
            <SubTaskListWrapper>
                <SubTaskListOpen>
                    {subTasks
                        .filter((subTask) => subTask.status === "open")
                        .map((subTask) => (
                            <SubTaskListItem
                                key={subTask.id}
                                subTask={subTask}
                                parentTaskId={parentTaskId}
                                onCheckboxChange={onCheckboxChange}
                                onDelete={onDelete}
                                onUpdateSubTask={onUpdateSubTask}
                            />
                        ))}
                </SubTaskListOpen>
                <SubTaskListDone>
                    {subTasks
                        .filter((subTask) => subTask.status === "done")
                        .map((subTask) => (
                            <SubTaskListItem
                                key={subTask.id}
                                subTask={subTask}
                                parentTaskId={parentTaskId}
                                onCheckboxChange={onCheckboxChange}
                                onDelete={onDelete}
                                onUpdateSubTask={onUpdateSubTask}
                            />
                        ))}
                </SubTaskListDone>
                {!showSubTaskForm && (
                    <ButtonSecondary
                        text="+ Add Sub-Task"
                        type="button"
                        onClick={toggleSubTaskForm}
                    />
                )}
                {showSubTaskForm && (
                    <SubTaskForm
                        task={null}
                        parentTaskId={parentTaskId}
                        isEditing={false}
                        onSubmit={onSubmitSubTask}
                        onCancel={toggleSubTaskForm}
                        onDelete={() => {
                            console.log("Implement this!");
                        }}
                    />
                )}
            </SubTaskListWrapper>
        </>
    );
}

const SubTaskListWrapper = styled.section`
    border-left: 1px dashed gray;
    margin: 16px 0 16px 32px;
    padding: 0 0 0 16px;
`;

const SubTaskListOpen = styled.ul`
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 16px;
`;

const SubTaskListDone = styled.ul`
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 8px;

    > li,
    > li > button {
        color: gray;
        text-decoration: line-through;
    }

    input[type="checkbox"] {
        accent-color: gray;
    }
`;
