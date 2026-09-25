import styled from "styled-components";
import type { Task } from "@/types/task";
import { type SubmitEvent } from "react";
import SubTaskListItem from "../SubTaskListItem/SubTaskListItem";
import ButtonSecondary from "../ButtonSecondary/ButtonSecondary";
import { useState } from "react";
import ButtonPrimarySmall from "../ButtonPrimary/ButtonPrimarySmall";
import ButtonSecondarySmall from "../ButtonSecondary/ButtonSecondarySmall";

type SubTaskListProps = {
    subTasks: Task[];
    parentTaskId: number;
    onCheckboxChange: (id: number, newStatus: "open" | "done") => void;
    onSubmitSubTask: (
        event: SubmitEvent<HTMLFormElement>,
        parentTaskId: number,
    ) => void;
};

export default function SubTaskList({
    subTasks,
    parentTaskId,
    onCheckboxChange,
    onSubmitSubTask,
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
                                onCheckboxChange={onCheckboxChange}
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
                                onCheckboxChange={onCheckboxChange}
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
                        onSubmit={(event) => {
                            onSubmitSubTask(event, parentTaskId);
                        }}
                    >
                        <TitleInput type="text" name="subTaskTitle" autoFocus={true} />
                        <ButtonContainer>
                            <ButtonPrimarySmall text="Add" type="submit" />
                            <ButtonSecondarySmall
                                text="Cancel"
                                type="button"
                                onClick={toggleSubTaskForm}
                            />
                        </ButtonContainer>
                    </SubTaskForm>
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

const SubTaskForm = styled.form`
    padding-left: 24px;
`;

const TitleInput = styled.input`
    width: 100%;
    padding: 4px;
    border-radius: 8px;
    border: 1px solid #bdbdbd;
    margin-bottom: 8px;
    font-size: 1rem;
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 8px;
`;
