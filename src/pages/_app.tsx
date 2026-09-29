import "../styles/globals.css";
import type { AppProps } from "next/app";
import Header from "../../components/Header/Header";
import Navigation from "../../components/Navigation/Navigation";

export default function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Header />
            <Navigation />
            <Component {...pageProps} />
        </>
    );
}
