import styled from "styled-components";
import { SubmitEvent, useState } from "react";
import type { Category } from "@/types/category";
import { MAX_CATEGORY_NAME_LENGTH } from "@/lib/validation";
import ButtonPrimary from "../ButtonPrimary/ButtonPrimary";
import ButtonSecondary from "../ButtonSecondary/ButtonSecondary";
import ButtonTertiary from "../ButtonTertiary/ButtonTertiary";
import CharCount from "../CharCount/CharCount";

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
    const [nameLength, setNameLength] = useState(category?.name?.length ?? 0);

    return (
        <>
            <Headline>
                {category ? "Edit Category" : "Add New Category"}
            </Headline>
            <StyledForm onSubmit={onSubmit}>
                <InputContainer>
                    <StyledColorInput
                        type="color"
                        name="color"
                        defaultValue={category?.color}
                    />
                    <NameWrapper>
                        <StyledInput
                            type="text"
                            name="name"
                            required={true}
                            autoFocus={!category}
                            defaultValue={category?.name}
                            maxLength={MAX_CATEGORY_NAME_LENGTH}
                            onChange={(event) =>
                                setNameLength(event.target.value.length)
                            }
                        />
                        <CharCount
                            current={nameLength}
                            max={MAX_CATEGORY_NAME_LENGTH}
                        />
                    </NameWrapper>
                </InputContainer>
                <ButtonContainer>
                    <ButtonPrimary
                        text={category ? "Update" : "Add"}
                        type="submit"
                        disabled={false}
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
                        text={null}
                        onClick={() => {
                            onDelete(category.id);
                        }}
                    />
                )}
            </StyledForm>
        </>
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
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #bdbdbd;
    margin-bottom: 8px;
    font-size: 1rem;
`;

const StyledColorInput = styled.input`
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid #bdbdbd;
    padding: 2px;
`;

const InputContainer = styled.div`
    width: 100%;
    display: flex;
    gap: 4px;
`;

const NameWrapper = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 16px;
`;

const Headline = styled.h2`
    margin-bottom: 16px;
`;
