import { ConversionError, Parser } from "./TypeConverter";
import { Ok, Result } from "ts-results";

export default Parser({
    type: "string",

    convert(value: string): Result<string, ConversionError> {
        return Ok(value);
    },
});
