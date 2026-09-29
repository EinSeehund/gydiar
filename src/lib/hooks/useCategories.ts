import useSWR from "swr";
import { SubmitEvent } from "react";
import type { Category } from "@/types/category";

type CategoryResponse = {
    success: boolean;
    categories: Category[];
};

const fetcher = (url: string) => fetch(url).then((response) => response.json());

export function useCategories() {
    const { data, error, isLoading, mutate } = useSWR<CategoryResponse>(
        "/api/categories",
        fetcher,
    );

    async function addCategory(
        event: SubmitEvent<HTMLFormElement>,
    ): Promise<void> {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formObject = Object.fromEntries(formData.entries());
        
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
    }

    async function updateCategory(
        event: SubmitEvent<HTMLFormElement>,
        id: number
    ): Promise<void> {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const formObject = Object.fromEntries(formData.entries());
        
        const newCatName = formObject.name;
        if (typeof newCatName !== "string" || !newCatName.trim()) {
            return;
        }
        const response = await fetch(`/api/categories/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formObject),
        });

        if (!response.ok) {
            return;
        }
    }

    return { data, error, isLoading, mutate, addCategory, updateCategory };
}
