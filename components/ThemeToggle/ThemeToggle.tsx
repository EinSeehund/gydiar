import { useSyncExternalStore } from "react";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import styled from "styled-components";

type Theme = "light" | "dark";

function subscribe(onChange: () => void): () => void {
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
}

function getSnapshot(): Theme {
    return document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light";
}

function getServerSnapshot(): Theme {
    return "light";
}

export default function ThemeToggle() {
    const theme = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot,
    );

    function toggleTheme(): void {
        const next: Theme = theme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
    }

    return (
        <StyledButton
            onClick={toggleTheme}
            aria-label={
                theme === "dark"
                    ? "Zum hellen Modus wechseln"
                    : "Zum dunklen Modus wechseln"
            }
        >
            {theme === "dark" ? <MdOutlineLightMode /> : <MdOutlineDarkMode />}
        </StyledButton>
    );
}

const StyledButton = styled.button`
    display: flex;
    align-items: center;
    background: none;
    border: none;
    padding: 0;
    font-size: 1.2rem;
    line-height: 0;
    color: var(--foreground);
    cursor: pointer;
`;
