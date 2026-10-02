import { ScaleLoader } from "react-spinners";

<ScaleLoader color="#36d7b7" />
import styled from "styled-components";

export default function LoadingSpinner() {
    return (
        <Wrapper>
            <ScaleLoader color="#36d7b7" />
        </Wrapper>
    );
}

const Wrapper = styled.div`
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
`;
