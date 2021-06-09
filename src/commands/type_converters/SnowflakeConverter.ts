import { ConversionError, TypeConverter } from "./TypeConverter";
import { Err, Ok, Result } from "ts-results";

export default TypeConverter({
    type: "snowflake",

    convert(value: string): Result<string, ConversionError> {
        const snowflake_regex = /^\d{17,}$/;

        if (!snowflake_regex.test(value)) {
            return Err(new ConversionError(this.type, value));
        }

        return Ok(value);
    },
});
