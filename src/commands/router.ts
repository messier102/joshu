import { Command } from "./command";
import { CommandHandler } from "./handlers/base";

import GiveRole from "./handlers/giverole";
import Ping from "./handlers/ping";
import Say from "./handlers/say";

export class CommandRouter {
    private readonly command_handlers: Map<string, CommandHandler>;

    constructor() {
        // TODO: dynamic import based on files
        this.command_handlers = new Map([
            ["ping", new Ping()],
            ["giverole", new GiveRole()],
            ["say", new Say()],
        ]);
    }

    route_to_handler(command: Command): void {
        const command_handler = this.command_handlers.get(command.name);

        if (command_handler) {
            if (command_handler.can_handle_command(command)) {
                command_handler.handle_command(command);
            } else {
                command.source.reply(
                    // TODO: specify reason
                    "sorry, this command cannot be executed."
                );
            }
        } else {
            command.source.reply("sorry, no such command.");
        }
    }
}
