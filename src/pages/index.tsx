import type { NextPage } from "next";
import Head from "next/head";
import styled from "styled-components";
import { useTasks } from "@/lib/hooks/useTasks";
import { useState, type JSX, type SubmitEvent } from "react";
import Modal from "../../components/Modal/Modal";
import TaskForm from "../../components/TaskForm/TaskForm";
import ButtonPrimary from "../../components/ButtonPrimary/ButtonPrimary";

const Home: NextPage = ({}): JSX.Element => {
    const [showTaskForm, setShowTaskForm] = useState<boolean>(false);

    const { data, error, isLoading, mutate } = useTasks();

    function toggleTaskForm(): void {
        setShowTaskForm(!showTaskForm);
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
                        onSubmit={handleNewTask}
                        onCancel={toggleTaskForm}
                    />
                </Modal>
            )}
            <main>
                <Container>
                    <Tasklist>
                        {tasksInDb.map((task) => (
                            <TaskListItem key={task.id}>
                                <input type="checkbox" />
                                {task.title}
                            </TaskListItem>
                        ))}
                    </Tasklist>
                    <ButtonPrimary
                        text="Add Task"
                        type="button"
                        onClick={toggleTaskForm}
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
