import { ParsingError, Parser } from "./parser";
import { Err, Ok, Result } from "ts-results";

export const pSnowflake = Parser({
    type: "snowflake",

    parse(value: string): Result<string, ParsingError> {
        const snowflake_regex = /^\d{17,}$/;

        if (!snowflake_regex.test(value)) {
            return Err(new ParsingError(this.type, value));
        }

        return Ok(value);
    },
});
