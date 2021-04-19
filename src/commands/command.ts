import type Discord from "discord.js";

export class Command {
    constructor(
        public readonly name: string,
        public readonly args: string[],
        public readonly source: Discord.Message
    ) {}

    static from_raw_message(message: Discord.Message, prefix: string): Command {
        const message_stripped = message.content.slice(prefix.length);
        const args = parse_arguments(message_stripped);
        const [command_name, ...command_args] = args;

        return new Command(command_name, command_args, message);
    }
}

function parse_arguments(message: string): string[] {
    const contiguous_or_quoted = /([^\s"']+)|"([^"]*)"|'([^']*)'/gi;

    // extract the arguments from capture groups
    const args = [...message.matchAll(contiguous_or_quoted)].map(
        (match) => match[1] ?? match[2] ?? match[3]
    );

    return args;
}
