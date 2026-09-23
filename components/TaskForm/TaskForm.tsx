import { type SubmitEvent } from "react";
import styled from "styled-components";
import ButtonPrimary from "../ButtonPrimary/ButtonPrimary";
import ButtonSecondary from "../ButtonSecondary/ButtonSecondary";
import { Task } from "@/types/task";
import ButtonTertiary from "../ButtonTertiary/ButtonTertiary";

type TaskFormProps = {
    task: Task | null;
    onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
    onCancel: () => void;
    onDelete: (id: number) => void;
    isEditing: boolean;
};

export default function TaskForm({
    task,
    onSubmit,
    onCancel,
    onDelete,
    isEditing,
}: TaskFormProps) {
    return (
        <StyledForm onSubmit={onSubmit}>
            <StyledInput
                type="text"
                name="taskTitle"
                autoFocus={!isEditing}
                defaultValue={task?.title}
                required
            />
            <ButtonContainer>
                <ButtonPrimary
                    text={isEditing ? "Update" : "Create"}
                    type="submit"
                />
                <ButtonSecondary
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
    );
}

const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 16px;
`;

const StyledInput = styled.input`
    width: 100%;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #bdbdbd;
    font-size: 1rem;
`;
