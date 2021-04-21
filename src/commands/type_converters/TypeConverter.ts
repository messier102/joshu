export interface TypeConverter {
    type: string;

    is_valid_type(value: string): boolean;
    convert(value: string): unknown;
}
