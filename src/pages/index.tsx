import type { NextPage } from "next";
import Head from "next/head";
import styled from "styled-components";
import { useTasks } from "@/lib/hooks/useTasks";
import { useState, type JSX, type SubmitEvent } from "react";
import Modal from "../../components/Modal/Modal";
import TaskForm from "../../components/TaskForm/TaskForm";
import ButtonPrimary from "../../components/ButtonPrimary/ButtonPrimary";
import { Task } from "@/types/task";
import TaskList from "../../components/TaskList/TaskList";

type TaskWithChildren = Task & {
    children: Task[];
};

const Home: NextPage = ({}): JSX.Element => {
    const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
    const [selectedTask, setSelectedTask] = useState<TaskWithChildren | null>(
        null,
    );

    const { data, error, isLoading, mutate } = useTasks();

    function openNewTaskForm(): void {
        setSelectedTask(null);
        setShowTaskForm(true);
    }

    function openEditTaskForm(task: TaskWithChildren): void {
        setSelectedTask(task);
        setShowTaskForm(true);
    }

    function closeTaskForm(): void {
        setSelectedTask(null);
        setShowTaskForm(false);
    }

    async function handleNewTask(
        event: SubmitEvent<HTMLFormElement>,
    ): Promise<void> {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formObject = Object.fromEntries(formData.entries());
        const taskTitle = formObject.taskTitle;
        if (typeof taskTitle !== "string" || !taskTitle.trim()) {
            return;
        }
        const response = await fetch("/api/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formObject),
        });

        if (!response.ok) {
            return;
        }

        await mutate();
        setShowTaskForm(false);
    }

    async function handleNewSubTask(
        event: SubmitEvent<HTMLFormElement>,
        parentTaskId: number,
    ): Promise<void> {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formObject = Object.fromEntries(formData.entries());
        const taskTitle = formObject.taskTitle;

        if (typeof taskTitle !== "string" || !taskTitle.trim()) {
            return;
        }

        const payload = {
            taskTitle,
            parent_task_id: parentTaskId,
        };

        const response = await fetch("/api/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            return;
        }

        const refreshedData = await mutate();

        if (selectedTask && refreshedData) {
            const updatedTask = refreshedData.tasks.find(
                (task) => task.id === selectedTask.id,
            );

            if (updatedTask) {
                setSelectedTask({
                    ...updatedTask,
                    children: refreshedData.tasks.filter(
                        (task) => task.parent_task_id === updatedTask.id,
                    ),
                });
            }
        }
    }

    async function handleUpdateTask(
        event: SubmitEvent<HTMLFormElement>,
        id: number,
    ): Promise<void> {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formObject = Object.fromEntries(formData.entries());
        const taskTitle = formObject.taskTitle;
        if (typeof taskTitle !== "string" || !taskTitle.trim()) {
            return;
        }

        const response = await fetch(`/api/tasks/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formObject),
        });

        if (!response.ok) {
            return;
        }

        const refreshedData = await mutate();

        if (selectedTask && refreshedData) {
            const updatedTask = refreshedData.tasks.find(
                (task) => task.id === selectedTask.id,
            );

            if (updatedTask) {
                setSelectedTask({
                    ...updatedTask,
                    children: refreshedData.tasks.filter(
                        (task) => task.parent_task_id === updatedTask.id,
                    ),
                });
            }
        }
    }

    async function handleDeleteTask(id: number): Promise<void> {
        const response = await fetch(`/api/tasks/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            return;
        }

        const refreshedData = await mutate();

        if (selectedTask && refreshedData) {
            const updatedTask = refreshedData.tasks.find(
                (task) => task.id === selectedTask.id,
            );

            if (updatedTask) {
                setSelectedTask({
                    ...updatedTask,
                    children: refreshedData.tasks.filter(
                        (task) => task.parent_task_id === updatedTask.id,
                    ),
                });
            }
        }
    }

    async function handleUpdateTaskStatus(
        id: number,
        newStatus: "open" | "done",
    ): Promise<void> {
        const response = await fetch(`/api/tasks/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newStatus),
        });

        if (!response.ok) {
            return;
        }

        const refreshedData = await mutate();

        if (selectedTask && refreshedData) {
            const updatedTask = refreshedData.tasks.find(
                (task) => task.id === selectedTask.id,
            );

            if (updatedTask) {
                setSelectedTask({
                    ...updatedTask,
                    children: refreshedData.tasks.filter(
                        (task) => task.parent_task_id === updatedTask.id,
                    ),
                });
            }
        }
    }

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Failed to load tasks.</p>;

    const tasksInDb = data?.tasks ?? [];

    return (
        <>
            <Head>
                <title>GYDIAR! - Tasks</title>
                <meta name="description" content="Get Your Ducks In A Row!" />
                <link rel="icon" href="/favicon.png" />
            </Head>
            {showTaskForm && (
                <Modal>
                    <TaskForm
                        task={selectedTask}
                        onSubmit={
                            selectedTask
                                ? (event) =>
                                      handleUpdateTask(event, selectedTask.id)
                                : handleNewTask
                        }
                        onCancel={closeTaskForm}
                        onDelete={handleDeleteTask}
                        onCloseForm={closeTaskForm}
                        onCheckboxChange={handleUpdateTaskStatus}
                        onSubmitSubTask={handleNewSubTask}
                        onUpdateSubTask={handleUpdateTask}
                        isEditing={selectedTask !== null}
                    />
                </Modal>
            )}
            <main>
                <Container>
                    <TaskList
                        taskList={tasksInDb}
                        onCheckboxChange={handleUpdateTaskStatus}
                        onTitleClick={openEditTaskForm}
                        onSubmitSubTask={handleNewSubTask}
                        onDelete={handleDeleteTask}
                        onUpdateSubTask={handleUpdateTask}
                    />
                    <ButtonPrimary
                        text="Add Task"
                        type="button"
                        onClick={() => {
                            openNewTaskForm();
                        }}
                    />
                </Container>
            </main>
        </>
    );
};

export default Home;

const Container = styled.div`
    padding: 64px;
`;
