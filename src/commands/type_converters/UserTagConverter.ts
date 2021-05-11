import { ConversionError, TypeConverter } from "./TypeConverter";

export default <TypeConverter>{
    type: "user tag",

    convert(value: string): string {
        const mention_regex = /^.+#\d{4}$/;
        const match = value.match(mention_regex);

        if (!match) {
            throw new ConversionError(this.type, value);
        }

        return match[0];
    },
};
