import { ConversionError, Parser } from "./TypeConverter";
import { Err, Ok, Result } from "ts-results";

export default Parser({
    type: "user tag",

    convert(value: string): Result<string, ConversionError> {
        const mention_regex = /^.+#\d{4}$/;
        const match = value.match(mention_regex);

        if (!match) {
            return Err(new ConversionError(this.type, value));
        }

        return Ok(match[0]);
    },
});
