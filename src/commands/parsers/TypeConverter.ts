import { Result } from "ts-results";

export interface Parser<T> {
    readonly type: string;

    convert(value: string): Result<T, ConversionError>;
}

export function Parser<T>({ type, convert }: Parser<T>): Parser<T> {
    return { type, convert };
}

export class ConversionError extends Error {
    constructor(
        public readonly expected_type: string,
        public readonly actual_value: string
    ) {
        super();
    }
}
