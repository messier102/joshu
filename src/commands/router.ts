import path from "path";
import fs from "fs/promises";
import { CommandRequest } from "./request";
import { Command } from "./command";
import { find_similar_string, Weights } from "../find_similar_string";
import { CommandResponse } from "./response";
import { MessageEmbed } from "discord.js";

export class CommandRouter {
    private readonly command_routes: Map<
        string,
        Command<unknown[]>
    > = new Map();

    constructor() {
        this.load_routes();
    }

    private async load_routes(): Promise<void> {
        const commands_dir = path.join(__dirname, "commands");
        const filenames = await fs.readdir(commands_dir);

        for (const filename of filenames) {
            const command_file = path.join(commands_dir, filename);
            const command_module = await import(command_file);
            const command: Command<unknown[]> = command_module.default;

            const command_name = filename.split(".")[0];

            this.command_routes.set(command_name, command);

            if (command.meta.aliases) {
                for (const alias of command.meta.aliases) {
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

    async route_request(request: CommandRequest): Promise<CommandResponse> {
        if (request.name === "help") {
            if (request.args) {
                const command = this.command_routes.get(request.args);

                if (!command) {
                    const similar_commands = this.find_similar_commands(
                        request.args
                    );

                    const no_such_command_message =
                        similar_commands.length > 0
                            ? `sorry, no such command. Did you mean \`${similar_commands[0]}\`?`
                            : "sorry, no such command.";

                    return CommandResponse.Error(no_such_command_message);
                }

                return command.help();
            } else {
                const command_names = [...this.command_routes.keys()];

                return new CommandResponseHelpList(command_names);
            }
        } else {
            const command = this.command_routes.get(request.name);

            if (!command) {
                const similar_commands = this.find_similar_commands(
                    request.name
                );

                const no_such_command_message =
                    similar_commands.length > 0
                        ? `sorry, no such command. Did you mean \`${similar_commands[0]}\`?`
                        : "sorry, no such command.";

                return CommandResponse.Error(no_such_command_message);
            }

            return await command.execute(request);
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

class CommandResponseHelpList implements CommandResponse {
    constructor(public readonly command_names: string[]) {}

    to_embed(): MessageEmbed {
        return new MessageEmbed()
            .setColor("BLUE")
            .setThumbnail("https://b.catgirlsare.sexy/LKkQS5_G.png")
            .setTitle("Available commands")
            .setDescription(this.command_names.join("\n"))
            .setFooter(`Use "help <command>" for more information.`);
    }
}
