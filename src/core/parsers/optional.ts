import { Ok } from "ts-results";
import { Parser } from "./parser";

export function optional<T>(parser: Parser<T>): Parser<T | undefined> {
    const type = parser.type + "?";

    const parse = (value: string) =>
        value ? parser.parse(value) : Ok(undefined);

    return { type, parse };
}
