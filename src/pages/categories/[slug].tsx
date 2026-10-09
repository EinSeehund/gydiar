import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

import { useState, type JSX, type SubmitEvent } from "react";

import { useTasks } from "@/lib/hooks/useTasks";
import { useCategories } from "@/lib/hooks/useCategories";
import { useProjects } from "@/lib/hooks/useProjects";
import useTaskEditor from "@/lib/hooks/useTaskEditor";
import TaskEditorModal from "../../../components/TaskEditorModal/TaskEditorModal";
import styled from "styled-components";
import ButtonPrimary from "../../../components/ButtonPrimary/ButtonPrimary";
import TaskList from "../../../components/TaskList/TaskList";
import Modal from "../../../components/Modal/Modal";
import CategoryForm from "../../../components/CategoryForm/CategoryForm";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";

const CategoryPage: NextPage = ({}): JSX.Element => {
    const [showCategoryForm, setShowCategoryForm] = useState<boolean>(false);

    const router = useRouter();
    const { slug } = router.query;
    const categorySlug = typeof slug === "string" ? slug : undefined;

    const tasksApi = useTasks({ category: categorySlug });

    const {
        data: TasksFetch,
        error: TasksError,
        isLoading: TasksIsLoading,
    } = tasksApi;

    const editor = useTaskEditor(tasksApi);

    const {
        openNewTaskForm,
        openEditTaskForm,
        handleNewSubTask,
        handleUpdateTask,
        handleDeleteTask,
        handleUpdateTaskStatus,
    } = editor;

    const {
        data: CategoriesFetch,
        error: CategoriesError,
        isLoading: CategoriesIsLoading,
        mutate: mutateCategories,
        updateCategory,
        deleteCategory,
    } = useCategories();

    const {
        data: ProjectsFetch,
        error: ProjectsError,
        isLoading: ProjectsIsLoading,
    } = useProjects();

    if (TasksIsLoading || CategoriesIsLoading || ProjectsIsLoading)
        return <LoadingSpinner />;
    if (TasksError || CategoriesError || ProjectsError)
        return <p>Failed to load tasks.</p>;

    const tasksInDb = TasksFetch?.tasks ?? [];
    const categoriesInDb = CategoriesFetch?.categories ?? [];
    const projectsInDb = ProjectsFetch?.projects ?? [];
    const currentCategory = CategoriesFetch?.categories.find(
        (category) => category.slug === categorySlug,
    ) ?? { id: 0, name: "Not found...", slug: "not-found", color: "#ffffff" };

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

    return (
        <>
            <Head>
                <title>GYDIAR! - {currentCategory.name}</title>
                <meta name="description" content="Get Your Ducks In A Row!" />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <TaskEditorModal
                editor={editor}
                defaultValues={{
                    defaultCategory: currentCategory.id,
                    defaultProject: null,
                }}
            />
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
                    <CategoryTitleContainer>
                        <CategoryTitle $color={currentCategory.color}>
                            {currentCategory.name}
                        </CategoryTitle>
                        <CategoryEditButton onClick={openCategoryForm}>
                            Edit Category
                        </CategoryEditButton>
                    </CategoryTitleContainer>
                    <TaskList
                        taskList={tasksInDb}
                        categories={categoriesInDb}
                        categoriesVisible={false}
                        projects={projectsInDb}
                        projectsVisible={true}
                        allowHideOverdueFilter={false}
                        onCheckboxChange={handleUpdateTaskStatus}
                        onTitleClick={openEditTaskForm}
                        onSubmitSubTask={handleNewSubTask}
                        onUpdateSubTask={handleUpdateTask}
                        onDelete={handleDeleteTask}
                    />
                    <ButtonWrapper>
                        <ButtonPrimary
                            text="Add Task"
                            type="button"
                            onClick={() => {
                                openNewTaskForm();
                            }}
                            disabled={false}
                        />
                    </ButtonWrapper>
                </Container>
            </main>
        </>
    );
};

export default CategoryPage;

const Container = styled.div`
    padding: 30px 64px;

    @media screen and (max-width: 600px) {
        padding: 20px;
    }

    @media screen and (min-width: 601px) and (max-width: 992px) {
        padding: 30px 30px 0 0;
    }
`;

const CategoryTitleContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 32px;
`;

const CategoryTitle = styled.h2<{ $color: string }>`
    border-left: 8px solid ${({ $color }) => $color};
    border-radius: 6px;
    padding-left: 20px;
`;

const CategoryEditButton = styled.button`
    border: none;
    background: none;
    font-size: small;
    margin-top: 8px;
    margin-left: 29px;
    cursor: pointer;
`;

const ButtonWrapper = styled.p`
    padding-left: 28px;
`;
