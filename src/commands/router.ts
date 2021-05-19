import path from "path";
import fs from "fs/promises";
import { CommandRequest } from "./request";
import { CommandExecutor } from "./executor";
import { Command } from "./command";
import { find_similar_string, Weights } from "../find_similar_string";

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
            const similar_commands = this.find_similar_commands(request.name);

            const no_such_command_message =
                similar_commands.length > 0
                    ? `sorry, no such command. Did you mean \`${similar_commands[0]}\`?`
                    : "sorry, no such command.";

            request.source.reply(no_such_command_message);
            return;
        }

        const executor = new CommandExecutor(command);

        try {
            request.source.channel.startTyping();

            const execution_result = executor.execute(request);
            if (!execution_result.ok) {
                const error = execution_result.val;

                request.source.reply(
                    `error: ${error.message}.\nUsage: \`${
                        request.name
                    } ${executor.usage()}\``
                );
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                // temporary
                request.source.reply(
                    `error: ${e.message}.\nUsage: \`${
                        request.name
                    } ${executor.usage()}\``
                );
            }
        } finally {
            request.source.channel.stopTyping();
        }
    }

    private find_similar_commands(command_name: string): string[] {
        const command_names = [...this.command_routes.keys()];
        const weights: Weights = {
            substitution: 3,
            insertion: 0,
            deletion: 1,
        };
        const max_distance = 6;

        return find_similar_string(
            command_names,
            weights,
            max_distance,
            command_name
        );
    }
}
