import type { NextPage } from "next";
import Head from "next/head";
import { JSX } from "react";
import styled from "styled-components";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useTasks } from "@/lib/hooks/useTasks";
import { useCategories } from "@/lib/hooks/useCategories";
import { useProjects } from "@/lib/hooks/useProjects";
import useTaskEditor from "@/lib/hooks/useTaskEditor";
import TaskEditorModal from "../../components/TaskEditorModal/TaskEditorModal";
import TaskList from "../../components/TaskList/TaskList";
import ButtonPrimary from "../../components/ButtonPrimary/ButtonPrimary";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

const TodayPage: NextPage = ({}): JSX.Element => {
    const now = new Date();
    const from = format(startOfMonth(now), "yyyy-MM-dd");
    const to = format(endOfMonth(now), "yyyy-MM-dd");

    const today = format(new Date(), "yyyy-MM-dd");

    const tasksApi = useTasks({ from, to });

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

    return (
        <>
            <Head>
                <title>GYDIAR! - This Month</title>
                <meta name="description" content="Get Your Ducks In A Row!" />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <TaskEditorModal
                editor={editor}
                defaultValues={{ defaultDueDate: today }}
            />
            <main>
                <Container>
                    <StyledPageTitle>This Month</StyledPageTitle>
                    <TaskList
                        taskList={tasksInDb}
                        categories={categoriesInDb}
                        categoriesVisible={true}
                        projects={projectsInDb}
                        projectsVisible={true}
                        allowHideOverdueFilter={true}
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
                            disabled={false}
                        />
                    </ButtonWrapper>
                </Container>
            </main>
        </>
    );
};

export default TodayPage;

const Container = styled.div`
    padding: 30px 64px;

    @media screen and (max-width: 600px) {
        padding: 20px;
    }

    @media screen and (min-width: 601px) and (max-width: 992px) {
        padding: 30px 30px 0 0;
    }
`;

const ButtonWrapper = styled.p`
    padding-left: 28px;
`;

const StyledPageTitle = styled.h2`
    margin-bottom: 32px;
    padding-left: 28px;
`;
