import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { useState, type JSX, type SubmitEvent } from "react";

import { Task } from "@/types/task";
import { useTasks } from "@/lib/hooks/useTasks";
import { useCategories } from "@/lib/hooks/useCategories";
import styled from "styled-components";
import ButtonPrimary from "../../../components/ButtonPrimary/ButtonPrimary";
import TaskList from "../../../components/TaskList/TaskList";
import TaskForm from "../../../components/TaskForm/TaskForm";
import Modal from "../../../components/Modal/Modal";
import CategoryForm from "../../../components/CategoryForm/CategoryForm";

type TaskWithChildren = Task & {
    children: Task[];
};

const CategoryPage: NextPage = ({}): JSX.Element => {
    const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
    const [showCategoryForm, setShowCategoryForm] = useState<boolean>(false);
    const [selectedTask, setSelectedTask] = useState<TaskWithChildren | null>(
        null,
    );

    const router = useRouter();
    const { slug } = router.query;
    const categorySlug = typeof slug === "string" ? slug : undefined;

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
    } = useTasks({ category: categorySlug });

    const {
        data: CategoriesFetch,
        error: CategoriesError,
        isLoading: CategoriesIsLoading,
        mutate: mutateCategories,
        updateCategory,
        deleteCategory,
    } = useCategories();

    if (TasksIsLoading || CategoriesIsLoading) return <p>Loading...</p>;
    if (TasksError || CategoriesError) return <p>Failed to load tasks.</p>;

    const tasksInDb = TasksFetch?.tasks ?? [];
    const categoriesInDb = CategoriesFetch?.categories ?? [];
    const currentCategory = CategoriesFetch?.categories.find(
        (category) => category.slug === categorySlug,
    ) ?? { id: 0, name: "Not found...", slug: "not-found", color: "#ffffff" };

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

    function openCategoryForm(): void {
        setShowCategoryForm(true);
    }

    function closeCategoryForm(): void {
        setShowCategoryForm(false);
    }

    async function handleUpdateCategory(
        event: SubmitEvent<HTMLFormElement>,
        id: number,
    ): Promise<void> {
        await updateCategory(event, id);
        await mutateCategories();
        setShowCategoryForm(false);
    }

    async function handleDeleteCategory(id: number): Promise<void> {
        await deleteCategory(id);
        await router.push("/");
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
            {showCategoryForm && (
                <Modal>
                    <CategoryForm
                        category={currentCategory}
                        onClose={closeCategoryForm}
                        onSubmit={(event) =>
                            handleUpdateCategory(event, currentCategory.id)
                        }
                        onDelete={handleDeleteCategory}
                    />
                </Modal>
            )}
            <main>
                <Container>
                    <CategoryTitle $color={currentCategory.color}>
                        {currentCategory.name}
                    </CategoryTitle>
                    <button onClick={openCategoryForm}>Edit Category</button>
                    <TaskList
                        taskList={tasksInDb}
                        categories={categoriesInDb}
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

export default CategoryPage;

const Container = styled.div`
    padding: 64px;
`;

const CategoryTitle = styled.h2<{ $color: string }>`
    border-left: 8px solid ${({ $color }) => $color};
    border-radius: 6px;
    padding-left: 20px;
    margin-bottom: 32px;
`;
