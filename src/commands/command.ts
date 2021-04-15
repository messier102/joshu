import type Discord from "discord.js";

export class Command {
    constructor(
        public readonly name: string,
        public readonly args: string[],
        public readonly source: Discord.Message
    ) {}

    static from_raw_message(message: Discord.Message, prefix: string): Command {
        const args = message.content.slice(prefix.length).split(" ");
        const [command_name, ...command_args] = args;

        return new Command(command_name, command_args, message);
    }
}
