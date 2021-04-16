import { PermissionResolvable, Permissions } from "discord.js";
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
            [
                "giverole",
                with_permissions([Permissions.FLAGS.MANAGE_ROLES], giverole),
            ],
            ["say", say],
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

// TODO: ideally, each command should define its own required permissions and other checks
function with_permissions(
    permissions: PermissionResolvable[],
    handler: CommandHandler
): CommandHandler {
    return (command) => {
        if (!command.source.member?.hasPermission(permissions)) {
            command.source.reply(
                "sorry, you don't have sufficient permissions for that."
            );
            return;
        }

        handler(command);
    };
}
