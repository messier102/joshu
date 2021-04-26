import { ConversionError, TypeConverter } from "./TypeConverter";

export default <TypeConverter>{
    type: "positive number",

    convert(value: string): number {
        const number_regex = /\d+(\.\d+)?/;
        const match = value.match(number_regex);

        if (!match) {
            throw new ConversionError(this.type, value);
        }

        return Number.parseFloat(match[0]);
    },
};
