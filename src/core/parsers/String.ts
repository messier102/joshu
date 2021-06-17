import { ParsingError, Parser } from "./parser";
import { Ok, Result } from "ts-results";

export const pString = Parser({
    type: "string",

    parse(value: string): Result<string, ParsingError> {
        return Ok(value);
    },
});
