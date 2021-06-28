import { ParsingError, Parser } from "./parser";
import { Err, Ok, Result } from "ts-results";

export const pBoolean = Parser({
    type: "boolean",

    parse(value: string): Result<boolean, ParsingError> {
        const boolean_regex = /^(true|false)$/;
        const match = value.match(boolean_regex);

        if (!match) {
            return Err(new ParsingError(this.type, value));
        }

        return Ok(match[0] === "true");
    },
});
