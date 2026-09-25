import { type SubmitEvent } from "react";
import styled from "styled-components";
import { Task } from "@/types/task";
import ButtonPrimarySmall from "../ButtonPrimary/ButtonPrimarySmall";
import ButtonSecondarySmall from "../ButtonSecondary/ButtonSecondarySmall";
import ButtonTertiarySmall from "../ButtonTertiary/ButtonTertiarySmall";

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

interface StyledFormProps {
    $isEditing: boolean;
}

export default function SubTaskForm({
    task,
    parentTaskId,
    isEditing,
    onSubmit,
    onCancel,
    onDelete,
}: SubTaskFormProps) {
    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        onSubmit(event, parentTaskId);
        event.target.reset();
    }

    return (
        <>
            <StyledForm
                onSubmit={(event) => {
                    handleSubmit(event);
                }}
                $isEditing={isEditing}
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
                    <ButtonTertiarySmall
                        text="Delete"
                        type="button"
                        onClick={() => onDelete(task.id)}
                    />
                )}
            </StyledForm>
        </>
    );
}

const StyledForm = styled.form<StyledFormProps>`
    padding-left: ${({ $isEditing }) => ($isEditing ? "0" : "24px")};
    margin-top: ${({ $isEditing }) => ($isEditing ? "-5px" : "0")};
    transform: ${({ $isEditing }) => ($isEditing ? "translate(-5px)" : "none")};
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
`;

const StyledInput = styled.input`
    width: 100%;
    padding: 4px;
    border-radius: 8px;
    border: 1px solid #bdbdbd;
    margin-bottom: 8px;
    font-size: 1rem;
`;
