import { Err, Ok, Result } from "ts-results";
import { range } from "./util";

/**
 * Splits a string of space-separated arguments into an array of strings, honoring quotes.
 *
 * An unquoted argument can be any contiguous sequence of characters except space and double quote `"`.
 * If an argument begins with a double quote `"`, everything until the closing quote is treated as a single
 * argument, including whitespace. To use a quote mark within a quoted argument, use the escape
 * sequence `\"`. Quoted arguments must be separated by whitespace to avoid parsing ambiguity.
 * Quoted arguments must be terminated by a closing quote.
 *
 * The string must have exactly `param_count` arguments. If `accept_remainder` is set to true,
 * this function parses `param_count - 1` space-separated arguments and passes the remaining
 * input as the final argument. Quotes and spaces in the remainder argument are treated literally.
 * The remainder argument cannot be empty.
 *
 * @param input A string of potentially-quoted, space-separated arguments.
 * @param param_count The expected number of arguments
 * @param accept_remainder A flag that enables passing the remaining input as the last argument.
 * @returns An array of individual argument strings
 */
export function split_args(
    input: string,
    param_count: number,
    accept_remainder: boolean
): Result<string[], string> {
    const is_last_param = (idx: number) => idx === param_count - 1;

    const args = [];
    let remaining_input = input.trim();

    for (const i of range(0, param_count)) {
        if (!remaining_input) {
            return Err("too few arguments");
        }

        if (is_last_param(i) && accept_remainder) {
            args.push(remaining_input);
            remaining_input = "";
        } else {
            const split_result = split_single_arg(remaining_input);
            if (split_result.err) {
                return split_result;
            }

            const [arg, rest] = split_result.val;

            args.push(arg);
            remaining_input = rest.trim();
        }
    }

    if (remaining_input) {
        return Err("too many arguments");
    }

    return Ok(args);
}

function split_single_arg(input: string): Result<[string, string], string> {
    if (input.startsWith(`"`)) {
        return split_quoted_arg(input);
    } else {
        return split_simple_arg(input);
    }
}

function split_quoted_arg(input: string): Result<[string, string], string> {
    const quoted_arg_regex = /^"((?:\\"|[^"])*)"(.*)$/;
    const match = input.match(quoted_arg_regex);

    if (!match) {
        return Err("probably missing closing quote");
    }

    const [_, arg, rest] = match;
    if (rest && !rest.startsWith(" ")) {
        return Err("quoted arguments must be delimited by space");
    }

    const arg_unescaped = arg.replace(/\\"/g, `"`);

    return Ok([arg_unescaped, rest] as [string, string]);
}

function split_simple_arg(input: string): Result<[string, string], string> {
    const simple_arg_regex = /^(\S+)(.*)$/;
    const match = input.match(simple_arg_regex);

    if (!match) {
        return Err("unexpected end of input");
    }

    const [_, arg, rest] = match;
    if (arg.includes(`"`)) {
        return Err("unexpected quote mark inside argument");
    }

    return Ok([arg, rest] as [string, string]);
}
