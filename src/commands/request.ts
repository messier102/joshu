import type Discord from "discord.js";

export class CommandRequest {
    constructor(
        public readonly name: string,
        public readonly args: string,
        public readonly source: Discord.Message
    ) {}

    static from_raw_message(
        message: Discord.Message,
        prefix: string
    ): CommandRequest {
        const message_stripped = message.content.slice(prefix.length).trim();

        const request_regex = /^(\S+) *(.*)$/;
        const match = message_stripped.match(request_regex);

        if (!match) {
            throw new Error(`Bad request: ${message_stripped}`);
        }

        const [_, command_name, command_args] = match;

        return new CommandRequest(command_name, command_args, message);
    }
}
