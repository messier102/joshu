export interface TypeConverter {
    readonly type: string;

    convert(value: string): unknown;
}

export class ConversionError extends Error {
    constructor(
        public readonly expected_type: string,
        public readonly actual_value: string
    ) {
        super();
    }
}
