import { ConversionError, TypeConverter } from "./TypeConverter";
import { Err, Ok, Result } from "ts-results";

export default <TypeConverter>{
    type: "mention",

    convert(value: string): Result<string, ConversionError> {
        const mention_regex = /^<@!?(\d+)>$/;
        const match = value.match(mention_regex);

        if (!match) {
            return Err(new ConversionError(this.type, value));
        }

        return Ok(match[1]);
    },
};
