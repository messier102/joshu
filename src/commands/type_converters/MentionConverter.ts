import { ConversionError, TypeConverter } from "./TypeConverter";

export default <TypeConverter>{
    type: "mention",

    convert(value: string): string {
        const mention_regex = /<@!?(\d+)>/;
        const match = value.match(mention_regex);

        if (!match) {
            throw new ConversionError(this.type, value);
        }

        return match[1];
    },
};
