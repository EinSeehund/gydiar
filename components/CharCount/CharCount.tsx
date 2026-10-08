import styled from "styled-components";

type CharCountProps = {
    current: number;
    max: number;
};

export default function CharCount({ current, max }: CharCountProps) {
    const remaining = max - current;
    const status: "normal" | "low" | "over" =
        remaining < 0 ? "over" : remaining <= max * 0.1 ? "low" : "normal";

    return (
        <Count $status={status} aria-live="polite">
            {current} / {max}
        </Count>
    );
}

const Count = styled.span<{ $status: "normal" | "low" | "over" }>`
    align-self: flex-end;
    font-size: 0.75rem;
    color: ${({ $status }) =>
        $status === "over"
            ? "#d80202"
            : $status === "low"
              ? "#b36b00"
              : "#8a8a8a"};
`;
