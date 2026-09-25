import styled from "styled-components";

export default function Header() {
    return (
        <HeaderContainer>
            <BigDuck>🦆</BigDuck>
        </HeaderContainer>
    );
}

const HeaderContainer = styled.header`
    display: flex;
    justify-content: center;
    background-color: var(--foreground);
`;

const BigDuck = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 8px;
    font-size: 2rem;
    background-color: var(--background);
    border-radius: 50%;
    height: 50px;
    width: 50px;
`;
