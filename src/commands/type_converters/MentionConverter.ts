import { TypeConverter } from "./TypeConverter";

const mention_regex = /<@!(\d+)>/;

export default <TypeConverter>{
    type: "mention",

    is_valid_type(value: string): boolean {
        return mention_regex.test(value);
    },

    convert(value: string): string {
        return value.match(mention_regex)![1];
    },
};
