import styled from "styled-components";

export default function Header() {
    return (
        <HeaderContainer>
            <BigDuck>🦆</BigDuck>
            <BigDuck>🦆</BigDuck>
            <BigDuck>🦆</BigDuck>
            <StyledTitle>Gydiar!</StyledTitle>
            <BigDuck>🦆</BigDuck>
            <BigDuck>🦆</BigDuck>
            <BigDuck>🦆</BigDuck>
        </HeaderContainer>
    );
}

const HeaderContainer = styled.header`
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    background-color: var(--background);
    border-bottom: 1px solid black;
    padding-left: 40px;
`;

const BigDuck = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 8px;
    font-size: 1.8rem;
    background-color: var(--background);
    border-radius: 50%;
    height: 40px;
    width: 0px;
`;

const StyledTitle = styled.h1`
    font-size: 1.3rem;
    letter-spacing: 1px;
    margin: 0 32px;
`;
