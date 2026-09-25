import type { JSX, ReactNode } from "react";
import styled from "styled-components";

export default function Modal({
    children,
}: {
    children: ReactNode;
}): JSX.Element {
    return (
        <Overlay>
            <Container>{children}</Container>
        </Overlay>
    );
}

const Overlay = styled.div`
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    background: rgba(46, 46, 46, 0.7);
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Container = styled.section`
    width: 85%;
    max-height: 85vh;
    overflow-y: auto;
    background-color: var(--background);
    padding: 32px;
    border-radius: 16px;
`;
