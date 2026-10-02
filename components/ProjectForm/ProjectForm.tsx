import styled from "styled-components";
import { SubmitEvent } from "react";
import type { Project } from "@/types/project";
import ButtonPrimary from "../ButtonPrimary/ButtonPrimary";
import ButtonSecondary from "../ButtonSecondary/ButtonSecondary";
import ButtonTertiary from "../ButtonTertiary/ButtonTertiary";

type ProjectFormProps = {
    project: Project | null;
    onClose: () => void;
    onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
    onDelete: (id: number) => void;
};

export default function ProjectForm({
    project,
    onClose,
    onSubmit,
    onDelete,
}: ProjectFormProps) {
    return (
        <>
            <Headline>{project ? "Edit Project" : "Add New Project"}</Headline>
            <StyledForm onSubmit={onSubmit}>
                <InputContainer>
                    <label htmlFor="name">Title</label>
                    <StyledInput
                        id="name"
                        type="text"
                        name="name"
                        required={true}
                        autoFocus={!project}
                        defaultValue={project?.name}
                    />
                    <label htmlFor="description">Description</label>
                    <StyledTextArea
                        id="description"
                        name="description"
                        rows={10}
                        defaultValue={project?.description ?? ""}
                    />
                </InputContainer>
                <ButtonContainer>
                    <ButtonPrimary
                        text={project ? "Update" : "Add"}
                        type="submit"
                    />
                    <ButtonSecondary
                        text="Cancel"
                        type="button"
                        onClick={onClose}
                    />
                </ButtonContainer>
                {project && (
                    <ButtonTertiary
                        type="button"
                        text={null}
                        onClick={() => {
                            onDelete(project.id);
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
    width: 100%;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #bdbdbd;
    margin-bottom: 8px;
    font-size: 1rem;
`;

const InputContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 16px;
`;

const Headline = styled.h2`
    margin-bottom: 16px;
`;

const StyledTextArea = styled.textarea`
    resize: none;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #bdbdbd;
    font-size: 1rem;
    font-family: inherit;
`;
