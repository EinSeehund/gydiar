import styled from "styled-components";
import { SubmitEvent } from "react";
import type { Category } from "@/types/category";
import ButtonPrimary from "../ButtonPrimary/ButtonPrimary";
import ButtonSecondary from "../ButtonSecondary/ButtonSecondary";
import ButtonTertiary from "../ButtonTertiary/ButtonTertiary";

type CategoryFormProps = {
    onClose: () => void;
    onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
    onDelete: (id: number) => void;
    category: Category | null;
};

export default function CategoryForm({
    onClose,
    onSubmit,
    onDelete,
    category,
}: CategoryFormProps) {
    return (
        <StyledForm onSubmit={onSubmit}>
            <InputContainer>
                <StyledColorInput
                    type="color"
                    name="color"
                    defaultValue={category?.color}
                />
                <StyledInput
                    type="text"
                    name="name"
                    required={true}
                    autoFocus={!category}
                    defaultValue={category?.name}
                />
            </InputContainer>
            <ButtonContainer>
                <ButtonPrimary
                    text={category ? "Update" : "Add"}
                    type="submit"
                />
                <ButtonSecondary
                    text="Cancel"
                    type="button"
                    onClick={onClose}
                />
            </ButtonContainer>
            {category && (
                <ButtonTertiary
                    type="button"
                    text="Delete"
                    onClick={() => {
                        onDelete(category.id);
                    }}
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

const StyledInput = styled.input`
    width: 90%;
    padding: 4px;
    border-radius: 8px;
    border: 1px solid #bdbdbd;
    margin-bottom: 8px;
    font-size: 1rem;
`;

const StyledColorInput = styled.input`
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 1px solid #bdbdbd;
    padding: 2px;
`;

const InputContainer = styled.div`
    width: 100%;
    display: flex;
    gap: 4px;
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 16px;
`;
