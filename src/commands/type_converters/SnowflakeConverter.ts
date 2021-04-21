import { ConversionError, TypeConverter } from "./TypeConverter";

export default <TypeConverter>{
    type: "snowflake",

    convert(value: string): string {
        const snowflake_regex = /^\d{17,}$/;

        if (!snowflake_regex.test(value)) {
            throw new ConversionError(this.type, value);
        }

        return value;
    },
};
