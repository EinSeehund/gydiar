import type { NextPage } from "next";
import Head from "next/head";
import { JSX } from "react";
import styled from "styled-components";
import { useRoutines } from "@/lib/hooks/useRoutines";
import { useCategories } from "@/lib/hooks/useCategories";
import useRoutineEditor from "@/lib/hooks/useRoutineEditor";
import RoutineEditorModal from "../../components/RoutineEditorModal/RoutineEditorModal";
import RoutineList from "../../components/RoutineList/RoutineList";
import ButtonPrimary from "../../components/ButtonPrimary/ButtonPrimary";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

const RoutinesPage: NextPage = (): JSX.Element => {
    const routinesApi = useRoutines();
    const {
        data: RoutinesFetch,
        error: RoutinesError,
        isLoading: RoutinesIsLoading,
    } = routinesApi;
    const routineEditor = useRoutineEditor(routinesApi);

    const {
        data: CategoriesFetch,
        error: CategoriesError,
        isLoading: CategoriesIsLoading,
    } = useCategories();

    if (RoutinesIsLoading || CategoriesIsLoading) return <LoadingSpinner />;
    if (RoutinesError || CategoriesError)
        return <p>Failed to load routines.</p>;

    const routinesInDb = RoutinesFetch?.routines ?? [];
    const categoriesInDb = CategoriesFetch?.categories ?? [];

    return (
        <>
            <Head>
                <title>GYDIAR! - Routines</title>
                <meta name="description" content="Get Your Ducks In A Row!" />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <RoutineEditorModal editor={routineEditor} />
            <main>
                <Container>
                    <StyledPageTitle>Routines</StyledPageTitle>
                    <RoutineList
                        routines={routinesInDb}
                        categories={categoriesInDb}
                        onTitleClick={routineEditor.openEditRoutineForm}
                    />
                    <ButtonWrapper>
                        <ButtonPrimary
                            text="Add Routine"
                            type="button"
                            onClick={routineEditor.openNewRoutineForm}
                            disabled={false}
                        />
                    </ButtonWrapper>
                </Container>
            </main>
        </>
    );
};

export default RoutinesPage;

const Container = styled.div`
    padding: 30px 64px;

    @media screen and (max-width: 600px) {
        padding: 20px;
    }

    @media screen and (min-width: 601px) and (max-width: 992px) {
        padding: 30px 30px 0 0;
    }
`;

const ButtonWrapper = styled.p`
    padding-left: 28px;
`;

const StyledPageTitle = styled.h2`
    margin-bottom: 32px;
    padding-left: 28px;
`;
