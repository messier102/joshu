import { Command } from "./command";
import { CommandHandler } from "./handler";

import fs from "fs/promises";
import path from "path";

export class CommandRouter {
    private readonly command_handlers: Map<string, CommandHandler> = new Map();

    constructor() {
        this.load_handlers();
    }

    private async load_handlers(): Promise<void> {
        const handlers_dir = path.join(__dirname, "handlers");
        const filenames = await fs.readdir(handlers_dir);

        for (const filename of filenames) {
            const handler_file = path.join(handlers_dir, filename);
            const handler_module = await import(handler_file);
            const handler_class: new () => CommandHandler =
                handler_module.default;

            const command_name = filename.split(".")[0];
            this.command_handlers.set(command_name, new handler_class());
        }

        console.log("Loaded commands:");
        console.log(this.command_handlers);
    }

    route_to_handler(command: Command): void {
        const command_handler = this.command_handlers.get(command.name);

        if (command_handler) {
            if (command_handler.can_handle_command(command)) {
                command_handler.handle_command(command);
            } else {
                command.source.reply(
                    // TODO: specify reason
                    `sorry, this command cannot be executed.\nUsage: \`${
                        command.name
                    } ${command_handler.usage()}\``
                );
            }
        } else {
            command.source.reply("sorry, no such command.");
        }
    }
}
