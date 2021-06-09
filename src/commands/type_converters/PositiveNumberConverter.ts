import { ConversionError, TypeConverter } from "./TypeConverter";
import { Err, Ok, Result } from "ts-results";

export default TypeConverter({
    type: "positive number",

    convert(value: string): Result<number, ConversionError> {
        const number_regex = /^\d+(\.\d+)?$/;
        const match = value.match(number_regex);

        if (!match) {
            return Err(new ConversionError(this.type, value));
        }

        return Ok(Number.parseFloat(match[0]));
    },
});
