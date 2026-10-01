import { type SubmitEvent } from "react";
import styled from "styled-components";
import { Task } from "@/types/task";
import { useCategories } from "@/lib/hooks/useCategories";
import { useProjects } from "@/lib/hooks/useProjects";
import SubTaskList from "../SubTaskList/SubTaskList";
import ButtonPrimary from "../ButtonPrimary/ButtonPrimary";
import ButtonSecondary from "../ButtonSecondary/ButtonSecondary";
import ButtonTertiary from "../ButtonTertiary/ButtonTertiary";

type TaskWithChildren = Task & {
    children: Task[];
};

type TaskFormProps = {
    task: TaskWithChildren | null;
    defaultValues: {
        defaultCategory?: number | "";
        defaultProject?: number | null;
        defaultDueDate?: string;
    };
    onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
    onCancel: () => void;
    onDelete: (id: number) => void;
    onCloseForm: () => void;
    onCheckboxChange: (id: number, newStatus: "open" | "done") => void;
    isEditing: boolean;
    onSubmitSubTask: (
        event: SubmitEvent<HTMLFormElement>,
        parentTaskId: number,
    ) => void;
    onUpdateSubTask: (event: SubmitEvent<HTMLFormElement>, id: number) => void;
};

export default function TaskForm({
    task,
    defaultValues,
    onSubmit,
    onCancel,
    onDelete,
    onCloseForm,
    onCheckboxChange,
    isEditing,
    onSubmitSubTask,
    onUpdateSubTask,
}: TaskFormProps) {
    const {
        data: CategoriesFetch,
        error: CategoriesError,
        isLoading: CategoriesIsLoading,
    } = useCategories();
    const {
        data: ProjectsFetch,
        error: ProjectsError,
        isLoading: ProjectsIsLoading,
    } = useProjects();

    if (CategoriesIsLoading || ProjectsIsLoading) return <p>Loading...</p>;
    if (CategoriesError || ProjectsError) return <p>Failed to load tasks.</p>;

    const categoriesInDb = CategoriesFetch?.categories ?? [];
    const projectsInDb = ProjectsFetch?.projects ?? [];

    function handleDelete(taskId: number) {
        if (task) {
            onDelete(taskId);
            onCloseForm();
        }
    }
    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        onSubmit(event);
        onCloseForm();
    }

    return (
        <>
            <Headline>{task ? "Edit Task" : "Add New Task"}</Headline>
            <StyledForm onSubmit={handleSubmit}>
                <FormItemWrapper>
                    <label htmlFor="taskTitle">Title</label>
                    <StyledInput
                        id="taskTitle"
                        type="text"
                        name="taskTitle"
                        autoFocus={!isEditing}
                        defaultValue={task?.title}
                        required
                    />
                </FormItemWrapper>
                <FormItemWrapper>
                    <label htmlFor="category-select">Category</label>
                    <StyledSelect
                        id="category-select"
                        name="category_id"
                        defaultValue={
                            task?.category_id ?? defaultValues.defaultCategory
                        }
                    >
                        <option value={""}>None</option>
                        {categoriesInDb.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </StyledSelect>
                </FormItemWrapper>
                <FormItemWrapper>
                    <label htmlFor="project-select">Project</label>
                    <StyledSelect
                        id="project-select"
                        name="project_id"
                        defaultValue={
                            task?.project_id ??
                            defaultValues.defaultProject ??
                            ""
                        }
                    >
                        <option value={""}>None</option>
                        {projectsInDb.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.name}
                            </option>
                        ))}
                    </StyledSelect>
                </FormItemWrapper>
                <FormItemWrapper>
                    <label htmlFor="due_date">Due Date</label>
                    <StyledInput
                        type="date"
                        id="due_date"
                        name="due_date"
                        defaultValue={
                            task?.due_date ?? defaultValues.defaultDueDate ?? ""
                        }
                    />
                </FormItemWrapper>
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
                        onClick={() => handleDelete(task.id)}
                    />
                )}
            </StyledForm>
            {task !== null && (
                <SubTaskListContainer>
                    <SubTaskList
                        subTasks={task.children}
                        onCheckboxChange={onCheckboxChange}
                        onSubmitSubTask={onSubmitSubTask}
                        onDelete={onDelete}
                        parentTaskId={task.id}
                        onUpdateSubTask={onUpdateSubTask}
                    />
                </SubTaskListContainer>
            )}
        </>
    );
}

const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 32px;
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 16px;
`;

const StyledInput = styled.input`
    width: 100%;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #bdbdbd;
    font-size: 1rem;
    font-family: inherit;
`;

const FormItemWrapper = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const StyledSelect = styled.select`
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #bdbdbd;
    font-size: 1rem;
`;

const SubTaskListContainer = styled.div`
    transform: translate(-32px);
`;

const Headline = styled.h2`
    margin-bottom: 16px;
`;
