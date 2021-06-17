import { ParsingError, Parser } from "./parser";
import { Err, Ok, Result } from "ts-results";

export const pUserTag = Parser({
    type: "user tag",

    parse(value: string): Result<string, ParsingError> {
        const mention_regex = /^.+#\d{4}$/;
        const match = value.match(mention_regex);

        if (!match) {
            return Err(new ParsingError(this.type, value));
        }

        return Ok(match[0]);
    },
});
