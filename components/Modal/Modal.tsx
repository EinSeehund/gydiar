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
    z-index: 12;
    display: flex;
    justify-content: center;
    align-items: center;

    @media screen and (max-width: 600px) {
        align-items: flex-start;
        padding-top: 20px;
    }
`;

const Container = styled.section`
    width: 85%;
    max-width: 400px;
    max-height: 85vh;
    overflow-y: auto;
    background-color: var(--background);
    padding: 32px;
    border-radius: 16px;

    @media screen and (max-width: 600px) {
        width: 95%;
        padding: 16px;
    }
`;
