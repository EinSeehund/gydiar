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

    const { data, isLoading, error, mutate } = useCategories();
    const { asPath } = useRouter();

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Failed to load tasks.</p>;

    const categories = data?.categories;

    const linkStyle = (href: string) => ({
        fontWeight: asPath === href ? "bold" : "normal",
        textDecoration: asPath === href ? "underline" : "none",
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
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formObject = Object.fromEntries(formData.entries());
        console.log(formObject);
        const newCatName = formObject.name;
        if (typeof newCatName !== "string" || !newCatName.trim()) {
            return;
        }
        const response = await fetch("/api/categories", {
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
        setShowCategoryForm(false);
    }

    return (
        <>
            {showCategoryForm && (
                <Modal>
                    <CategoryForm
                        onClose={closeCategoryForm}
                        onSubmit={handleNewCategory}
                    />
                </Modal>
            )}
            <NavContainer>
                <NavBar>
                    <Link href="/" style={linkStyle("/")}>
                        All Tasks
                    </Link>
                    <hr />
                    <h3>Categories</h3>
                    {categories?.map((category: Category) => (
                        <CategoryLink
                            key={category.id}
                            href={`/categories/${category.slug}`}
                            $color={category.color}
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
