import "../styles/globals.css";
import type { AppProps } from "next/app";
//import Header from "../../components/Header/Header";
import Navigation from "../../components/Navigation/Navigation";
import Router from "next/router";
import { SWRConfig } from "swr";
import { fetcher } from "@/lib/fetcher";

export default function MyApp({ Component, pageProps }: AppProps) {
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
                {/* <Header /> */}
                <Navigation />
                <Component {...pageProps} />
            </SWRConfig>
        </>
    );
}
