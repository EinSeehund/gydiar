import "../styles/globals.css";
import type { AppProps } from "next/app";
import Navigation from "../../components/Navigation/Navigation";
import Router from "next/router";
import { SWRConfig } from "swr";
import { fetcher } from "@/lib/fetcher";
import { authClient } from "@/lib/auth-client";

export default function MyApp({ Component, pageProps }: AppProps) {
    const { data: session } = authClient.useSession();
    
    return (
        <>
            <SWRConfig
                value={{
                    fetcher,
                    shouldRetryOnError: false,
                    onError: (error) => {
                        if (error.status === 401) Router.push("/login");
                    },
                }}
            >
                {session && <Navigation userName={session.user.name} />}
                <Component {...pageProps} />
            </SWRConfig>
        </>
    );
}
