import { type SubmitEvent } from "react";
import styled from "styled-components";
import { Task } from "@/types/task";
import ButtonTertiary from "../ButtonTertiary/ButtonTertiary";
import ButtonPrimarySmall from "../ButtonPrimary/ButtonPrimarySmall";
import ButtonSecondarySmall from "../ButtonSecondary/ButtonSecondarySmall";

type SubTaskFormProps = {
    task: Task | null;
    parentTaskId: number;
    isEditing: boolean;
    onSubmit: (
        event: SubmitEvent<HTMLFormElement>,
        parentTaskId: number,
    ) => void;
    onCancel: () => void;
    onDelete: (id: number) => void;
};

export default function SubTaskForm({
    task,
    parentTaskId,
    isEditing,
    onSubmit,
    onCancel,
    onDelete,
}: SubTaskFormProps) {
    return (
        <>
            <StyledForm
                onSubmit={(event) => {
                    onSubmit(event, parentTaskId);
                }}
            >
                <StyledInput
                    type="text"
                    name="taskTitle"
                    autoFocus={!isEditing}
                    defaultValue={task?.title}
                    required
                />
                <ButtonContainer>
                    <ButtonPrimarySmall
                        text={isEditing ? "Update" : "Add"}
                        type="submit"
                    />
                    <ButtonSecondarySmall
                        text="Cancel"
                        type="button"
                        onClick={onCancel}
                    />
                </ButtonContainer>
                {task && (
                    <ButtonTertiary
                        text="Delete"
                        type="button"
                        onClick={() => onDelete(task.id)}
                    />
                )}
            </StyledForm>
        </>
    );
}

const StyledForm = styled.form`
    padding-left: 24px;
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 8px;
`;

const StyledInput = styled.input`
    width: 100%;
    padding: 4px;
    border-radius: 8px;
    border: 1px solid #bdbdbd;
    margin-bottom: 8px;
    font-size: 1rem;
`;
