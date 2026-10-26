import type { NextPage } from "next";
import Head from "next/head";
import { JSX } from "react";
import styled from "styled-components";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { useTasks } from "@/lib/hooks/useTasks";
import { useCategories } from "@/lib/hooks/useCategories";
import { useProjects } from "@/lib/hooks/useProjects";
import useTaskEditor from "@/lib/hooks/useTaskEditor";
import { useRoutines } from "@/lib/hooks/useRoutines";
import { useRoutineOccurrences } from "@/lib/hooks/useRoutineOccurrences";
import useRoutineEditor from "@/lib/hooks/useRoutineEditor";
import TaskEditorModal from "../../components/TaskEditorModal/TaskEditorModal";
import RoutineEditorModal from "../../components/RoutineEditorModal/RoutineEditorModal";
import TaskList from "../../components/TaskList/TaskList";
import ButtonPrimary from "../../components/ButtonPrimary/ButtonPrimary";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

const TodayPage: NextPage = ({}): JSX.Element => {
    const now = new Date();
    const from = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
    const to = format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");

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
        data: OccurrencesFetch,
        error: OccurrencesError,
        isLoading: OccurrencesIsLoading,
        setOccurrenceDone,
    } = useRoutineOccurrences({ from, to, today });

    // Only needed to open the editor, so the page doesn't wait for it.
    const routinesApi = useRoutines();
    const routineEditor = useRoutineEditor(routinesApi);

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

    if (
        TasksIsLoading ||
        OccurrencesIsLoading ||
        CategoriesIsLoading ||
        ProjectsIsLoading
    )
        return <LoadingSpinner />;
    if (
        TasksError ||
        OccurrencesError ||
        CategoriesError ||
        ProjectsError
    )
        return <p>Failed to load tasks.</p>;

    const tasksInDb = TasksFetch?.tasks ?? [];
    const occurrencesInDb = OccurrencesFetch?.occurrences ?? [];
    const categoriesInDb = CategoriesFetch?.categories ?? [];
    const projectsInDb = ProjectsFetch?.projects ?? [];

    return (
        <>
            <Head>
                <title>GYDIAR! - This Week</title>
                <meta name="description" content="Get Your Ducks In A Row!" />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <TaskEditorModal
                editor={editor}
                defaultValues={{ defaultDueDate: today }}
            />
            <RoutineEditorModal editor={routineEditor} />
            <main>
                <Container>
                    <StyledPageTitle>This Week</StyledPageTitle>
                    <TaskList
                        taskList={tasksInDb}
                        routineOccurrences={occurrencesInDb}
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
                        onRoutineCheckboxChange={setOccurrenceDone}
                        onRoutineTitleClick={routineEditor.openEditRoutineForm}
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
