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
import { RiMenuFold3Line } from "react-icons/ri";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import LogoutButton from "../LogoutButton/LogoutButton";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

type NavigationProps = {
    userName: string;
};

export default function Navigation({ userName }: NavigationProps) {
    const [showCategoryForm, setShowCategoryForm] = useState<boolean>(false);
    const [showProjectForm, setShowProjectForm] = useState<boolean>(false);
    const [showNavMobile, setShowNavMobile] = useState<boolean>(false);

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

    if (CategoryIsLoading || ProjectIsLoading) return <LoadingSpinner />;
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
    function toggleNavMobile() {
        setShowNavMobile(!showNavMobile);
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
            <NavContainer $navVisible={showNavMobile}>
                <NavBar>
                    <Link
                        href="/today"
                        style={linkStyle("/today")}
                        aria-current={asPath === "/today" ? "page" : undefined}
                        onClick={toggleNavMobile}
                    >
                        Today
                    </Link>
                    <Link
                        href="/calendar"
                        style={linkStyle("/calendar")}
                        aria-current={
                            asPath === "/calendar" ? "page" : undefined
                        }
                        onClick={toggleNavMobile}
                    >
                        Calendar
                    </Link>
                    <Link
                        href="/"
                        style={linkStyle("/")}
                        aria-current={asPath === "/" ? "page" : undefined}
                        onClick={toggleNavMobile}
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
                            onClick={toggleNavMobile}
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
                            onClick={toggleNavMobile}
                        >
                            {project.name}
                        </ProjectLink>
                    ))}
                    <AddButton onClick={openProjectForm}>
                        + New Project
                    </AddButton>
                </NavBar>
                <UserContainer>
                    <p>
                        Logged in as <b>{userName}</b>
                    </p>
                    <LogoutButton />
                </UserContainer>
                <ThemeToggleWrapper>
                    <ThemeToggle />
                </ThemeToggleWrapper>
            </NavContainer>
            <NavButton onClick={toggleNavMobile}>
                <ButtonIcon $navVisible={showNavMobile}>
                    <RiMenuFold3Line />
                </ButtonIcon>
            </NavButton>
        </>
    );
}

const NavContainer = styled.div<{ $navVisible: boolean }>`
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    width: 250px;
    padding: 40px;
    padding-top: 30px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: var(--background);
    border-right: 1px solid gray;
    z-index: 11;

    @media screen and (max-width: 600px) {
        position: fixed;
        left: ${({ $navVisible }) => ($navVisible ? "0px" : "-250px")};
        transition: left 0.5s;
    }
`;

const NavBar = styled.nav`
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
    padding-bottom: 32px;

    & a[aria-current="page"]::after {
        content: "→";
        margin-left: 8px;
    }

    &:hover {
        scrollbar-color: color-mix(in srgb, var(--foreground) 10%, transparent) transparent;
        transition: scrollbar-color 0.6s;
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

const NavButton = styled.button`
    background-color: var(--foreground);
    color: var(--background);
    font-size: 2.2rem;
    position: fixed;
    bottom: 50px;
    right: 50px;
    border: none;
    border-radius: 50%;
    height: 50px;
    width: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9;

    @media screen and (min-width: 600px) {
        display: none;
    }
`;

const ButtonIcon = styled.div<{ $navVisible: boolean }>`
    font-size: 1.6rem;
    line-height: 0;
    transition: transform 0.2s ease;
    transform: rotate(
        ${({ $navVisible }) => ($navVisible ? "0deg" : "180deg")}
    );
    transform-origin: 50% 50%;
`;

const UserContainer = styled.div`
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    background-color: var(--background);
    color: var(--foreground);
    border-top: 1px dotted black;
    width: 100%;
    padding-top: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: small;

    b {
        font-size: medium;
    }
`;

const ThemeToggleWrapper = styled.div`
    margin-top: 4px;
`;
