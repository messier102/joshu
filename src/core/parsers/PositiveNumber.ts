import { ParsingError, Parser } from "./parser";
import { Err, Ok, Result } from "ts-results";

export const pPositiveNumber = Parser({
    type: "positive number",

    parse(value: string): Result<number, ParsingError> {
        const number_regex = /^\d+(\.\d+)?$/;
        const match = value.match(number_regex);

        if (!match) {
            return Err(new ParsingError(this.type, value));
        }

        return Ok(Number.parseFloat(match[0]));
    },
});
