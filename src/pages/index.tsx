import type { NextPage } from "next";
import Head from "next/head";
import styled from "styled-components";
import { useTasks } from "@/lib/hooks/useTasks";
import { useState, type JSX, type SubmitEvent } from "react";
import Modal from "../../components/Modal/Modal";
import TaskForm from "../../components/TaskForm/TaskForm";
import ButtonPrimary from "../../components/ButtonPrimary/ButtonPrimary";
import { Task } from "@/types/task";

const Home: NextPage = ({}): JSX.Element => {
    const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const { data, error, isLoading, mutate } = useTasks();

    function openNewTaskForm(): void {
        setSelectedTask(null);
        setShowTaskForm(true);
    }

    function openEditTaskForm(task: Task): void {
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

        await mutate();
        setShowTaskForm(false);
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

        await mutate();
        setShowTaskForm(false);
    }

    async function handleUpdateTaskStatus(
        id: number,
        newStatus: "open" | "done",
    ): Promise<void> {
        const response = await fetch(`api/tasks/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newStatus),
        });

        if (!response.ok) {
            return;
        }

        await mutate();
    }

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Failed to load tasks.</p>;

    const tasksInDb = data?.tasks ?? [];
    const activeTasks = tasksInDb.filter((task) => task.status === "open");
    const doneTasks = tasksInDb.filter((task) => task.status === "done");

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
                        isEditing={selectedTask !== null}
                    />
                </Modal>
            )}
            <main>
                <Container>
                    <TaskListActive>
                        {activeTasks.map((task) => (
                            <TaskListItem key={task.id}>
                                <input
                                    type="checkbox"
                                    checked={task.status === "done"}
                                    onChange={() =>
                                        handleUpdateTaskStatus(task.id, "done")
                                    }
                                    aria-label={`Mark ${task.title} as done`}
                                />
                                <button
                                    onClick={() => {
                                        openEditTaskForm(task);
                                    }}
                                >
                                    {task.title}
                                </button>
                            </TaskListItem>
                        ))}
                    </TaskListActive>
                    <ButtonPrimary
                        text="Add Task"
                        type="button"
                        onClick={() => {
                            openNewTaskForm();
                        }}
                    />
                    <TaskListDone>
                        {doneTasks.map((task) => (
                            <TaskListItem key={task.id}>
                                <input
                                    type="checkbox"
                                    checked={task.status === "done"}
                                    onChange={() =>
                                        handleUpdateTaskStatus(task.id, "open")
                                    }
                                    aria-label={`Mark ${task.title} as open`}
                                />
                                <button
                                    onClick={() => {
                                        openEditTaskForm(task);
                                    }}
                                >
                                    {task.title}
                                </button>
                            </TaskListItem>
                        ))}
                    </TaskListDone>
                </Container>
            </main>
        </>
    );
};

export default Home;

const Container = styled.div`
    padding: 64px;
`;

const TaskListActive = styled.ul`
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;
`;

const TaskListDone = styled.ul`
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 32px;
    margin-bottom: 32px;
    padding-top: 16px;
    border-top: 2px dotted gray;

    > li,
    > li > button {
        color: gray;
        text-decoration: line-through;
    }

    input[type="checkbox"] {
        accent-color: gray; /* Change to your preferred color */
    }
`;

const TaskListItem = styled.li`
    font-size: 1rem;

    > input {
        margin-right: 16px;

        &:hover {
            cursor: pointer;
        }
    }

    > button {
        background: none;
        border: none;
        font-size: 1rem;

        &:hover {
            cursor: pointer;
        }
    }
`;
