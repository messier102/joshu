export function split_args(
    input: string,
    arg_count: number,
    accept_remainder: boolean
): string[] {
    const args = [];

    let remaining_input = input.trim();

    if (!remaining_input) {
        throw new Error("too few arguments");
    }

    for (let i = 0; i < arg_count - 1; i++) {
        if (!remaining_input) {
            throw new Error("too few arguments");
        }

        const [arg, rest] = split_single_arg(remaining_input);

        args.push(arg);
        remaining_input = rest.trim();
    }

    if (accept_remainder) {
        if (!remaining_input) {
            throw new Error("too few arguments");
        }

        args.push(remaining_input);
    } else if (arg_count > 0) {
        const [arg, rest] = split_single_arg(remaining_input);

        args.push(arg);
        remaining_input = rest.trim();

        if (remaining_input) {
            throw new Error("too many arguments");
        }
    }

    console.log(args);

    return args;
}

function split_single_arg(input: string): [string, string] {
    if (input.startsWith(`"`)) {
        return split_quoted_arg(input);
    } else {
        return split_simple_arg(input);
    }
}

function split_quoted_arg(input: string): [string, string] {
    const quoted_arg_regex = /^"((?:\\"|[^"])*)"(.*)$/;
    const match = input.match(quoted_arg_regex);

    if (!match) {
        throw new Error("probably missing closing quote");
    }

    const [_, arg, rest] = match;
    if (rest && !rest.startsWith(" ")) {
        throw new Error("quoted arguments must be delimited by space");
    }

    return [arg, rest];
}

function split_simple_arg(input: string): [string, string] {
    const simple_arg_regex = /^(\S+)(.*)$/;
    const match = input.match(simple_arg_regex);

    if (!match) {
        throw new Error("unexpected end of input");
    }

    const [_, arg, rest] = match;
    if (arg.includes(`"`)) {
        throw new Error("unexpected quote mark inside argument");
    }

    return [arg, rest];
}
