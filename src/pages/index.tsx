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
                            selectedTask ? (event) => handleUpdateTask(event, selectedTask.id) : handleNewTask
                        }
                        onCancel={closeTaskForm}
                        isEditing={selectedTask !== null}
                    />
                </Modal>
            )}
            <main>
                <Container>
                    <Tasklist>
                        {tasksInDb.map((task) => (
                            <TaskListItem key={task.id}>
                                <input type="checkbox" />
                                <span
                                    onClick={() => {
                                        openEditTaskForm(task);
                                    }}
                                >
                                    {task.title}
                                </span>
                            </TaskListItem>
                        ))}
                    </Tasklist>
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

const Tasklist = styled.ul`
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;
`;

const TaskListItem = styled.li`
    font-size: 1rem;

    > input {
        margin-right: 16px;
    }
`;
