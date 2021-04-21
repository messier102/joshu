import { TypeConverter } from "./TypeConverter";

export default <TypeConverter>{
    type: "snowflake",

    is_valid_type(value: string): boolean {
        // discord snowflakes are at least 17 digits long
        // see https://archive.md/nvaQA
        const snowflake_regex = /^\d{17,}$/;

        return snowflake_regex.test(value);
    },

    convert(value: string): string {
        return value;
    },
};
