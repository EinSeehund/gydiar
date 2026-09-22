import type { NextPage } from "next";
import Head from "next/head";
import styled from "styled-components";
import { useTasks } from "@/lib/hooks/useTasks";
import type { JSX } from "react";

const Home: NextPage = ({}): JSX.Element => {
    const { data, error, isLoading } = useTasks();

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Failed to load tasks.</p>;

    const tasksInDb = data?.tasks ?? [];
    console.log(tasksInDb);

    return (
        <>
            <Head>
                <title>GYDIAR! - Tasks</title>
                <meta name="description" content="Get Your Ducks In A Row!" />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <main>
                <Container>
                    <Tasklist>
                        {tasksInDb.map((task) => (
                            <TaskListItem key={task.id}><input type="checkbox" />{task.title}</TaskListItem>
                        ))}
                    </Tasklist>
                </Container>
            </main>
        </>
    );
};

export default Home;

const Container = styled.div`
    padding: 64px;
`;

const Tasklist = styled.ul`
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const TaskListItem = styled.li`
    font-size: 1.3rem;

    > input {
        margin-right: 8px;
    }
`
