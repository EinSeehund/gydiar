import type { SubmitEvent } from "react";
import styled from "styled-components";
import ButtonPrimary from "../ButtonPrimary/ButtonPrimary";
import ButtonSecondary from "../ButtonSecondary/ButtonSecondary";

type TaskFormProps = {
    onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
    onCancel: () => void;
};

export default function TaskForm({ onCancel, onSubmit }: TaskFormProps) {
    return (
        <StyledForm onSubmit={onSubmit}>
            <StyledInput
                type="text"
                name="taskTitle"
                autoFocus={true}
                required
            />
            <ButtonContainer>
                <ButtonPrimary text="Create" type="submit" />
                <ButtonSecondary
                    text="Cancel"
                    type="button"
                    onClick={onCancel}
                />
            </ButtonContainer>
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
