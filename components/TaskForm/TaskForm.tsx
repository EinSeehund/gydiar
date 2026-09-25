import { type SubmitEvent } from "react";
import styled from "styled-components";
import ButtonPrimary from "../ButtonPrimary/ButtonPrimary";
import ButtonSecondary from "../ButtonSecondary/ButtonSecondary";
import { Task } from "@/types/task";
import ButtonTertiary from "../ButtonTertiary/ButtonTertiary";
import SubTaskList from "../SubTaskList/SubTaskList";

type TaskWithChildren = Task & {
    children: Task[];
};

type TaskFormProps = {
    task: TaskWithChildren | null;
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
    onSubmit,
    onCancel,
    onDelete,
    onCloseForm,
    onCheckboxChange,
    isEditing,
    onSubmitSubTask,
    onUpdateSubTask,
}: TaskFormProps) {
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
            <StyledForm onSubmit={handleSubmit}>
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

const SubTaskListContainer = styled.div`
    transform: translate(-32px);
`;
