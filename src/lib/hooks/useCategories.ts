import useSWR from "swr";
import type { Category } from "@/types/category";

type CategoryResponse = {
    success: boolean;
    categories: Category[];
};

const fetcher = (url: string) =>
    fetch(url).then((response) => response.json());

export function useCategories() {
    return useSWR<CategoryResponse>("/api/categories", fetcher);
}