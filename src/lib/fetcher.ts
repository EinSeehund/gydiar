export async function fetcher(url: string) {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error("Request failed") as Error & { status: number };
        error.status = res.status;
        throw error;
    }
    return res.json();
}