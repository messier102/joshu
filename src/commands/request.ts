import type Discord from "discord.js";
import { Err, Ok, Result } from "ts-results";

export class CommandRequest {
    constructor(
        public readonly name: string,
        public readonly args: string,
        public readonly source: Discord.Message
    ) {}

    static from_raw_message(
        message: Discord.Message,
        prefix: string
    ): Result<CommandRequest, Error> {
        const message_stripped = message.content.slice(prefix.length).trim();

        const request_regex = /^(\S+) *(.*)$/;
        const match = message_stripped.match(request_regex);

        if (!match) {
            return Err(new Error(`Bad request: ${message_stripped}`));
        }

        const [_, command_name, command_args] = match;

        return Ok(new CommandRequest(command_name, command_args, message));
    }
}
