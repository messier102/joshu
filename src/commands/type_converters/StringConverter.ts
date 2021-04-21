import { TypeConverter } from "./TypeConverter";

export default <TypeConverter>{
    type: "string",

    convert(value: string): string {
        return value;
    },
};
