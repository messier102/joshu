import { ConversionError, TypeConverter } from "./TypeConverter";
import { Ok, Result } from "ts-results";

export default TypeConverter({
    type: "string",

    convert(value: string): Result<string, ConversionError> {
        return Ok(value);
    },
});
