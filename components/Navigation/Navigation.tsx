import Link from "next/link";
import styled from "styled-components";
import type { Category } from "@/types/category";
import { useCategories } from "@/lib/hooks/useCategories";
import { useRouter } from "next/router";
import { useState } from "react";
import Modal from "../Modal/Modal";
import CategoryForm from "../CategoryForm/CategoryForm";
import { SubmitEvent } from "react";

export default function Navigation() {
    const [showCategoryForm, setShowCategoryForm] = useState<boolean>(false);

    const { data, isLoading, error, mutate, addCategory } = useCategories();
    const { asPath } = useRouter();

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Failed to load tasks.</p>;

    const categories = data?.categories;

    const linkStyle = (href: string) => ({
        fontWeight: asPath === href ? "bold" : "normal",
    });

    function openCategoryForm() {
        setShowCategoryForm(true);
    }
    function closeCategoryForm() {
        setShowCategoryForm(false);
    }
    async function handleNewCategory(
        event: SubmitEvent<HTMLFormElement>,
    ): Promise<void> {
        await addCategory(event);
        await mutate();
        setShowCategoryForm(false);
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
                    <CategoryAddButton onClick={openCategoryForm}>
                        + Add Category
                    </CategoryAddButton>
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
    padding-top: 106px;
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

const CategoryAddButton = styled.button`
    text-align: left;
    background: none;
    border: none;
    font-size: 0.9rem;
    margin-top: 8px;
    cursor: pointer;
`;
