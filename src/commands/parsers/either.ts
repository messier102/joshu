import { Result } from "ts-results";
import { ConversionError, Parser } from "./TypeConverter";

// TypeConverter<number> -> number
type TargetType<T> = T extends Parser<infer U> ? U : never;

// [TypeConverter<string>, TypeConverter<number>] -> [string, number]
type TargetTypeTuple<T extends Parser<unknown>[]> = {
    [key in keyof T]: TargetType<T[key]>;
};

// [TypeConverter<string>, TypeConverter<number>] -> string | number
type TargetTypeUnion<T extends Parser<unknown>[]> = TargetTypeTuple<T>[number];

/**
 * Combines multiple `TypeConverter`s into a single converter that applies them
 * in order and returns the value of the first successful conversion.
 *
 * @param converters A list of converters to apply.
 * @returns A single combined converter.
 */

// I'm not sure how to make this compile without `any`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function either<T extends Parser<any>[]>(
    ...converters: T
): Parser<TargetTypeUnion<T>> {
    const type = converters.map((c) => c.type).join(" | ");

    const convert = (value: string) => {
        const conversion_result = Result.any(
            ...converters.map((c) => c.convert(value))
        );

        return conversion_result.mapErr(
            (_) => new ConversionError(type, value)
        );
    };

    return { type, convert };
}
