import { TypeConverter } from "./TypeConverter";

export default <TypeConverter>{
    type: "string",

    is_valid_type(): boolean {
        return true;
    },

    convert(value: string): string {
        return value;
    },
};
