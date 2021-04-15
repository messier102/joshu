import type Discord from "discord.js";

export class Command {
    constructor(
        public name: string,
        public args: string[],
        public source: Discord.Message
    ) {}

    static from_raw_message(message: Discord.Message, prefix: string): Command {
        const args = message.content.slice(prefix.length).split(" ");
        const [command_name, ...command_args] = args;

        return new Command(command_name, command_args, message);
    }
}

type CommandHandler = (command: Command) => void;

type CommandHandlerStore = {
    [command_name: string]: CommandHandler;
};

export const command_handlers: CommandHandlerStore = {
    ping: ({ source }) => {
        source.reply("pong!");
    },
};
