import { ParsingError, Parser } from "./parser";
import { Err, Ok, Result } from "ts-results";

export const pMention = Parser({
    type: "mention",

    parse(value: string): Result<string, ParsingError> {
        const mention_regex = /^<@!?(\d+)>$/;
        const match = value.match(mention_regex);

        if (!match) {
            return Err(new ParsingError(this.type, value));
        }

        return Ok(match[1]);
    },
});
