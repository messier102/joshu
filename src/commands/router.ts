import path from "path";
import fs from "fs/promises";
import { CommandRequest } from "./request";
import { CommandExecutor } from "./executor";
import { Command } from "./command";

export class CommandRouter {
    private readonly command_routes: Map<string, Command> = new Map();

    constructor() {
        this.load_routes();
    }

    private async load_routes(): Promise<void> {
        const commands_dir = path.join(__dirname, "commands");
        const filenames = await fs.readdir(commands_dir);

        for (const filename of filenames) {
            const command_file = path.join(commands_dir, filename);
            const command_module = await import(command_file);
            const command: Command = command_module.default;

            const command_name = filename.split(".")[0];

            this.command_routes.set(command_name, command);

            if (command.aliases) {
                for (const alias of command.aliases) {
                    if (this.command_routes.has(alias)) {
                        console.log(
                            `Command alias collision: ${alias} already registered`
                        );
                    }

                    this.command_routes.set(alias, command);
                }
            }
        }

        console.log("Loaded commands:");
        console.log(this.command_routes);
    }

    route_request(request: CommandRequest): void {
        const command = this.command_routes.get(request.name);

        if (!command) {
            request.source.reply("sorry, no such command.");
            return;
        }

        const executor = new CommandExecutor(command);

        try {
            executor.execute(request, request.args);
        } catch (e: unknown) {
            const error = <Error>e;

            request.source.reply(
                `error: \`${error.message}\`\nUsage: \`${
                    request.name
                } ${executor.usage()}\``
            );
        }
    }
}
