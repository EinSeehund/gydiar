import Link from "next/link";
import styled from "styled-components";
import type { Category } from "@/types/category";
import type { Project } from "@/types/project";
import { useCategories } from "@/lib/hooks/useCategories";
import { useProjects } from "@/lib/hooks/useProjects";
import { useRouter } from "next/router";
import { useState } from "react";
import Modal from "../Modal/Modal";
import CategoryForm from "../CategoryForm/CategoryForm";
import { SubmitEvent } from "react";
import ProjectForm from "../ProjectForm/ProjectForm";

export default function Navigation() {
    const [showCategoryForm, setShowCategoryForm] = useState<boolean>(false);
    const [showProjectForm, setShowProjectForm] = useState<boolean>(false);

    const {
        data: CategoryData,
        isLoading: CategoryIsLoading,
        error: CategoryError,
        mutate: mutateCategories,
        addCategory,
    } = useCategories();
    const {
        data: ProjectData,
        isLoading: ProjectIsLoading,
        error: ProjectError,
        mutate: mutateProjects,
        addProject,
    } = useProjects();

    const { asPath } = useRouter();

    if (CategoryIsLoading || ProjectIsLoading) return <p>Loading...</p>;
    if (CategoryError || ProjectError) return <p>Failed to load tasks.</p>;

    const categories = CategoryData?.categories;
    const projects = ProjectData?.projects;

    const linkStyle = (href: string) => ({
        fontWeight: asPath === href ? "bold" : "normal",
    });

    function openCategoryForm() {
        setShowCategoryForm(true);
    }
    function closeCategoryForm() {
        setShowCategoryForm(false);
    }
    function openProjectForm() {
        setShowProjectForm(true);
    }
    function closeProjectForm() {
        setShowProjectForm(false);
    }

    async function handleNewCategory(
        event: SubmitEvent<HTMLFormElement>,
    ): Promise<void> {
        await addCategory(event);
        await mutateCategories();
        setShowCategoryForm(false);
    }
    async function handleNewProject(
        event: SubmitEvent<HTMLFormElement>,
    ): Promise<void> {
        await addProject(event);
        await mutateProjects();
        setShowProjectForm(false);
    }

    return (
        <>
            {showCategoryForm && (
                <Modal>
                    <CategoryForm
                        category={null}
                        onClose={closeCategoryForm}
                        onSubmit={handleNewCategory}
                        onDelete={() => {}}
                    />
                </Modal>
            )}
            {showProjectForm && (
                <Modal>
                    <ProjectForm
                        project={null}
                        onClose={closeProjectForm}
                        onSubmit={handleNewProject}
                        onDelete={() => {}}
                    />
                </Modal>
            )}
            <NavContainer>
                <NavBar>
                    <Link
                        href="/"
                        style={linkStyle("/")}
                        aria-current={asPath === "/" ? "page" : undefined}
                    >
                        All Tasks
                    </Link>
                    <hr />
                    <h3>Categories</h3>
                    {categories?.map((category: Category) => (
                        <CategoryLink
                            key={category.id}
                            href={`/categories/${category.slug}`}
                            style={linkStyle(`/categories/${category.slug}`)}
                            $color={category.color}
                            aria-current={
                                asPath === `/categories/${category.slug}`
                                    ? "page"
                                    : undefined
                            }
                        >
                            {category.name}
                        </CategoryLink>
                    ))}
                    <AddButton onClick={openCategoryForm}>
                        + Add Category
                    </AddButton>
                    <hr />
                    <h3>Projects</h3>
                    {projects?.map((project: Project) => (
                        <ProjectLink
                            key={project.id}
                            href={`/projects/${project.slug}`}
                            style={linkStyle(`/projects/${project.slug}`)}
                            aria-current={
                                asPath === `/projects/${project.slug}`
                                    ? "page"
                                    : undefined
                            }
                        >
                            {project.name}
                        </ProjectLink>
                    ))}
                    <AddButton onClick={openProjectForm}>
                        + New Project
                    </AddButton>
                </NavBar>
            </NavContainer>
        </>
    );
}

const NavContainer = styled.div`
    height: 100vh;
    position: fixed;
    left: 0;
    width: 250px;
    padding: 40px;
    padding-top: 30px;
    background-color: var(--background);
    border-right: 1px solid gray;

    @media screen and (max-width: 600px) {
        display: none;
    }
`;

const NavBar = styled.nav`
    display: flex;
    flex-direction: column;
    gap: 16px;

    & a[aria-current="page"]::after {
        content: "→";
        margin-left: 8px;
    }
`;

const CategoryLink = styled(Link)<{ $color: string }>`
    padding-left: 4px;
    border-left: 5px solid ${({ $color }) => $color};
    border-radius: 4px;
`;

const AddButton = styled.button`
    text-align: left;
    background: none;
    border: none;
    font-size: 0.9rem;
    margin-top: 8px;
    cursor: pointer;
`;

const ProjectLink = styled(Link)`
    font-style: italic;
`;
