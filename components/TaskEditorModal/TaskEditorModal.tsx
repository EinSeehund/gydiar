import { TaskEditor } from "@/lib/hooks/useTaskEditor";
import { TaskFormDefaults } from "@/types/task";
import { JSX } from "react";
import Modal from "../Modal/Modal";
import TaskForm from "../TaskForm/TaskForm";

type TaskEditorModalProps = {
    editor: TaskEditor;
    defaultValues?: TaskFormDefaults;
};

export default function TaskEditorModal({
    editor,
    defaultValues = {},
}: TaskEditorModalProps): JSX.Element | null {
    if (!editor.showTaskForm) return null;

    const { selectedTask } = editor;

    return (
        <Modal>
            <TaskForm
                task={selectedTask}
                defaultValues={{
                    ...defaultValues,
                    ...editor.newTaskDefaults,
                }}
                onSubmit={
                    selectedTask
                        ? (event) =>
                              editor.handleUpdateTask(event, selectedTask.id)
                        : editor.handleNewTask
                }
                onCancel={editor.closeTaskForm}
                onDelete={editor.handleDeleteTask}
                onCloseForm={editor.closeTaskForm}
                onCheckboxChange={editor.handleUpdateTaskStatus}
                onSubmitSubTask={editor.handleNewSubTask}
                onUpdateSubTask={editor.handleUpdateTask}
                isEditing={selectedTask !== null}
            />
        </Modal>
    );
}
