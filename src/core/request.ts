import type Discord from "discord.js";
import { Err, Ok, Result } from "ts-results";

export type ServerMessage = Discord.Message & {
    guild: NonNullable<Discord.Message["guild"]>;
    member: NonNullable<Discord.Message["member"]>;
};

export class Request {
    constructor(
        public readonly name: string,
        public readonly args: string,
        public readonly source: Discord.Message
    ) {}

    static from_raw_message(
        message: Discord.Message,
        prefix: string
    ): Result<Request, string> {
        const message_stripped = message.content.slice(prefix.length).trim();

        const request_regex = /^(\S+) *(.*)$/;
        const match = message_stripped.match(request_regex);

        if (!match) {
            return Err(`Bad request: ${message_stripped}`);
        }

        const [_, command_name, command_args] = match;

        return Ok(new Request(command_name, command_args, message));
    }
}

export type ValidatedRequest = Request & {
    source: ServerMessage;
};
