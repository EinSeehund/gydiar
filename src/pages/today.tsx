import type { NextPage } from "next";
import Head from "next/head";
import { useState, type JSX, type SubmitEvent } from "react";
import styled from "styled-components";
import { format } from "date-fns";
import { Task } from "@/types/task";
import { useTasks } from "@/lib/hooks/useTasks";
import { useCategories } from "@/lib/hooks/useCategories";
import { useProjects } from "@/lib/hooks/useProjects";
import Modal from "../../components/Modal/Modal";
import TaskList from "../../components/TaskList/TaskList";
import TaskForm from "../../components/TaskForm/TaskForm";
import ButtonPrimary from "../../components/ButtonPrimary/ButtonPrimary";

type TaskWithChildren = Task & {
    children: Task[];
};

const TodayPage: NextPage = ({}): JSX.Element => {
    const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
    const [selectedTask, setSelectedTask] = useState<TaskWithChildren | null>(
        null,
    );

    const today = format(new Date(), "yyyy-MM-dd");

    const {
        data: TasksFetch,
        error: TasksError,
        isLoading: TasksIsLoading,
        mutate: mutateTasks,
        addTask,
        addSubTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
    } = useTasks({ due: today });

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

    if (TasksIsLoading || CategoriesIsLoading || ProjectsIsLoading)
        return <p>Loading...</p>;
    if (TasksError || CategoriesError || ProjectsError)
        return <p>Failed to load tasks.</p>;

    const tasksInDb = TasksFetch?.tasks ?? [];
    const categoriesInDb = CategoriesFetch?.categories ?? [];
    const projectsInDb = ProjectsFetch?.projects ?? [];

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

    async function refreshUI(): Promise<void> {
        const refreshedData = await mutateTasks();

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

    async function handleNewTask(
        event: SubmitEvent<HTMLFormElement>,
    ): Promise<void> {
        await addTask(event);
        await mutateTasks();
        setShowTaskForm(false);
    }

    async function handleNewSubTask(
        event: SubmitEvent<HTMLFormElement>,
        parentTaskId: number,
    ): Promise<void> {
        await addSubTask(event, parentTaskId);
        await refreshUI();
    }

    async function handleUpdateTask(
        event: SubmitEvent<HTMLFormElement>,
        id: number,
    ): Promise<void> {
        await updateTask(event, id);
        await refreshUI();
    }

    async function handleDeleteTask(id: number): Promise<void> {
        await deleteTask(id);
        await refreshUI();
    }

    async function handleUpdateTaskStatus(
        id: number,
        newStatus: "open" | "done",
    ): Promise<void> {
        await updateTaskStatus(id, newStatus);
        await refreshUI();
    }

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
                        defaultValues={{ defaultDueDate: today }}
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
                    <StyledPageTitle>Today</StyledPageTitle>
                    <TaskList
                        taskList={tasksInDb}
                        categories={categoriesInDb}
                        categoriesVisible={true}
                        projects={projectsInDb}
                        projectsVisible={true}
                        onCheckboxChange={handleUpdateTaskStatus}
                        onTitleClick={openEditTaskForm}
                        onSubmitSubTask={handleNewSubTask}
                        onDelete={handleDeleteTask}
                        onUpdateSubTask={handleUpdateTask}
                    />
                    <ButtonWrapper>
                        <ButtonPrimary
                            text="Add Task"
                            type="button"
                            onClick={() => {
                                openNewTaskForm();
                            }}
                        />
                    </ButtonWrapper>
                </Container>
            </main>
        </>
    );
};

export default TodayPage;

const Container = styled.div`
    padding: 64px;
`;

const ButtonWrapper = styled.p`
    padding-left: 28px;
`;

const StyledPageTitle = styled.h2`
    margin-bottom: 32px;
`;
