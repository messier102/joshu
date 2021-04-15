import { Command } from "./command";

import giverole from "./handlers/giverole";
import ping from "./handlers/ping";
import say from "./handlers/say";

export type CommandHandler = (command: Command) => void;

export class CommandRouter {
    private readonly command_handlers: Map<string, CommandHandler>;

    constructor() {
        // TODO: dynamic import based on files
        this.command_handlers = new Map([
            ["ping", ping],
            ["giverole", giverole],
            ["say", say]
        ]);
    }

    route_to_handler(command: Command): void {
        const handle_command = this.command_handlers.get(command.name);

        if (handle_command) {
            handle_command(command);
        } else {
            command.source.reply("sorry, no such command.");
        }
    }
}
