import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";

import { useState, type JSX, type SubmitEvent } from "react";

import { Task } from "@/types/task";
import { useTasks } from "@/lib/hooks/useTasks";
import { useCategories } from "@/lib/hooks/useCategories";
import { useProjects } from "@/lib/hooks/useProjects";
import styled from "styled-components";
import ButtonPrimary from "../../../components/ButtonPrimary/ButtonPrimary";
import TaskList from "../../../components/TaskList/TaskList";
import TaskForm from "../../../components/TaskForm/TaskForm";
import Modal from "../../../components/Modal/Modal";
import ProjectForm from "../../../components/ProjectForm/ProjectForm";

type TaskWithChildren = Task & {
    children: Task[];
};

const ProjectPage: NextPage = ({}): JSX.Element => {
    const [showTaskForm, setShowTaskForm] = useState<boolean>(false);
    const [showProjectForm, setShowProjectForm] = useState<boolean>(false);
    const [selectedTask, setSelectedTask] = useState<TaskWithChildren | null>(
        null,
    );

    const router = useRouter();
    const { slug } = router.query;
    const projectSlug = typeof slug === "string" ? slug : undefined;

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
    } = useTasks({ project: projectSlug });

    const {
        data: CategoriesFetch,
        error: CategoriesError,
        isLoading: CategoriesIsLoading,
    } = useCategories();

    const {
        data: ProjectsFetch,
        error: ProjectsError,
        isLoading: ProjectsIsLoading,
        mutate: mutateProjects,
        updateProject,
        deleteProject,
    } = useProjects();

    if (TasksIsLoading || CategoriesIsLoading || ProjectsIsLoading)
        return <p>Loading...</p>;
    if (TasksError || CategoriesError || ProjectsError)
        return <p>Failed to load tasks.</p>;

    const tasksInDb = TasksFetch?.tasks ?? [];
    const categoriesInDb = CategoriesFetch?.categories ?? [];
    const projectsInDb = ProjectsFetch?.projects ?? [];
    const currentProject =
        ProjectsFetch?.projects.find(
            (project) => project.slug === projectSlug,
        ) ?? null;
    const projectCompleted =
        tasksInDb?.length > 0 &&
        !tasksInDb?.some((task) => task.status === "open");

    if (!currentProject) {
        return <p>Project not found.</p>;
    }

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

    function openProjectForm(): void {
        setShowProjectForm(true);
    }

    function closeProjectForm(): void {
        setShowProjectForm(false);
    }

    function calculatePercent(tasks: Task[]) {
        if (tasks.length > 0) {
            const tasksDone = tasks.filter((task) => task.status === "done");
            return Math.floor((100 / tasks.length) * tasksDone.length);
        }
        return 0;
    }

    async function handleUpdateProject(
        event: SubmitEvent<HTMLFormElement>,
        id: number,
    ): Promise<void> {
        await updateProject(event, id);
        await mutateProjects();
        closeProjectForm();
    }

    async function handleDeleteProject(id: number): Promise<void> {
        await deleteProject(id);
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
                        defaultValues={{
                            defaultProject: currentProject.id,
                        }}
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
            {showProjectForm && (
                <Modal>
                    <ProjectForm
                        project={currentProject}
                        onClose={closeProjectForm}
                        onSubmit={(event) =>
                            handleUpdateProject(event, currentProject.id)
                        }
                        onDelete={handleDeleteProject}
                    />
                </Modal>
            )}
            <main>
                <Container>
                    <ProjectTitleContainer>
                        <ProjectTitle>{currentProject.name}</ProjectTitle>
                        <PercentageDisplay>
                            {calculatePercent(tasksInDb)}% COMPLETED
                        </PercentageDisplay>
                        <ProjectEditButton onClick={openProjectForm}>
                            Edit Project
                        </ProjectEditButton>
                    </ProjectTitleContainer>
                    <ProjectDescription>
                        {currentProject.description}
                    </ProjectDescription>
                    {projectCompleted && (
                        <CelebrationMessage>
                            <h3>🎉🎉🎉 FINISHED! 🎉🎉🎉</h3>
                            <Image
                                src="/gydiar-machine.gif"
                                alt="Celebration"
                                width={253}
                                height={450}
                                unoptimized
                                loading="eager"
                            />
                            <p>
                                <b>Congratulations!</b> <br />You really got your ducks in a
                                row and completed all tasks in this project!
                            </p>
                        </CelebrationMessage>
                    )}
                    <TaskList
                        taskList={tasksInDb}
                        categories={categoriesInDb}
                        categoriesVisible={true}
                        projects={projectsInDb}
                        projectsVisible={false}
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
                        />
                    </ButtonWrapper>
                </Container>
            </main>
        </>
    );
};

export default ProjectPage;

const Container = styled.div`
    padding: 64px;
`;

const ProjectTitleContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 32px;
`;

const ProjectTitle = styled.h2`
    border-radius: 6px;
    padding-left: 28px;
    font-style: italic;
`;

const ProjectEditButton = styled.button`
    border: none;
    background: none;
    font-size: small;
    margin-top: 8px;
    margin-left: 29px;
    cursor: pointer;
`;

const ProjectDescription = styled.p`
    padding-left: 28px;
    margin-bottom: 32px;
    max-width: 500px;
`;

const ButtonWrapper = styled.p`
    padding-left: 28px;
`;

const PercentageDisplay = styled.span`
    background-color: var(--foreground);
    color: var(--background);
    margin: 8px 28px;
    padding: 4px 8px;
    font-weight: bold;
    border-radius: 4px;
    font-size: 0.7rem;
`;

const CelebrationMessage = styled.section`
    padding-left: 28px;
    display: flex;
    align-items: center;
    text-align: center;
    flex-direction: column;
    gap: 16px;
    max-width: 500px;
`;
