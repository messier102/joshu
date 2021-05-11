import { ConversionError, TypeConverter } from "./TypeConverter";

/**
 * Combines multiple `TypeConverter`s into a single converter that applies
 * them in order and returns the value of the first successful conversion.
 *
 * @param converters A list of converters to apply.
 * @returns A single combined converter.
 */
export function any(...converters: TypeConverter[]): TypeConverter {
    const type = converters.map((c) => c.type).join("|");

    const convert = (value: string): unknown => {
        for (const conv of converters) {
            try {
                const ret = conv.convert(value);
                return ret;
            } catch (e) {
                continue;
            }
        }

        throw new ConversionError(type, value);
    };

    return { type, convert };
}
