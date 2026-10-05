import { useRouter } from "next/router";
import { mutate } from "swr";
import { authClient } from "@/lib/auth-client";

export default function LogoutButton() {
    const router = useRouter();

    async function handleLogout() {
        await authClient.signOut();
        // SWR-Cache leeren, damit der nächste Nutzer keine alten Tasks sieht
        await mutate(() => true, undefined, { revalidate: false });
        router.push("/login");
    }

    return <button onClick={handleLogout}>Logout</button>;
}