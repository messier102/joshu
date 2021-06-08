import { Result } from "ts-results";

export interface TypeConverter<T> {
    readonly type: string;

    convert(value: string): Result<T, ConversionError>;
}

export function TypeConverter<T>({
    type,
    convert,
}: TypeConverter<T>): TypeConverter<T> {
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
