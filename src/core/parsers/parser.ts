import { Result } from "ts-results";

export interface Parser<T> {
    readonly type: string;

    parse(value: string): Result<T, ParsingError>;
}

export function Parser<T>({ type, parse }: Parser<T>): Parser<T> {
    return { type, parse };
}

export class ParsingError extends Error {
    constructor(
        public readonly expected_type: string,
        public readonly actual_value: string
    ) {
        super();
    }
}
