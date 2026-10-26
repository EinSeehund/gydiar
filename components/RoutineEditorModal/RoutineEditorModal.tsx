import type { JSX } from "react";
import type { RoutineEditor } from "@/lib/hooks/useRoutineEditor";
import Modal from "../Modal/Modal";
import RoutineForm from "../RoutineForm/RoutineForm";

type Props = {
    editor: RoutineEditor;
};

export default function RoutineEditorModal({
    editor,
}: Props): JSX.Element | null {
    if (!editor.showRoutineForm) return null;

    return (
        <Modal>
            <RoutineForm
                routine={editor.selectedRoutine}
                onSubmit={editor.handleSaveRoutine}
                onCancel={editor.closeRoutineForm}
                onDelete={editor.handleDeleteRoutine}
            />
        </Modal>
    );
}
