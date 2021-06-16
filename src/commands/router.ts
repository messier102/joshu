import path from "path";
import fs from "fs/promises";
import { CommandRequest } from "./request";
import { Command } from "./command";
import { find_similar_string, Weights } from "../find_similar_string";
import { CommandResponse, CommandResponseHelp } from "./response";
import { MessageEmbed } from "discord.js";

type AnyCommand = Command<unknown[]>;

export class CommandRouter {
    private readonly commands: Map<string, AnyCommand> = new Map();
    private readonly routes: Map<string, string> = new Map();

    constructor() {
        this.load_routes();
    }

    private async load_routes(): Promise<void> {
        const commands_dir = path.join(__dirname, "commands");
        const filenames = await fs.readdir(commands_dir);

        for (const filename of filenames) {
            const command_file = path.join(commands_dir, filename);
            const command_module = await import(command_file);
            const command: AnyCommand = command_module.default;

            this.commands.set(command.meta.name, command);
            this.routes.set(command.meta.name, command.meta.name);

            if (command.meta.aliases) {
                for (const alias of command.meta.aliases) {
                    if (this.routes.has(alias)) {
                        console.log(
                            `Command alias collision: ${alias} already registered`
                        );
                    }

                    this.routes.set(alias, command.meta.name);
                }
            }
        }

        console.log("Loaded commands:");
        console.log(this.routes);
    }

    async route_request(request: CommandRequest): Promise<CommandResponse> {
        if (request.name === "help") {
            if (request.args) {
                const command_name = this.routes.get(request.args);

                if (!command_name) {
                    const similar_commands = this.find_similar_commands(
                        request.args
                    );

                    const no_such_command_message =
                        similar_commands.length > 0
                            ? `sorry, no such command. Did you mean \`${similar_commands[0]}\`?`
                            : "sorry, no such command.";

                    return CommandResponse.Error(no_such_command_message);
                }

                return this.commands.get(command_name)!.help(request.args);
            } else {
                return new CommandResponseCommandList([
                    ...this.commands.values(),
                ]);
            }
        } else {
            const command_name = this.routes.get(request.name);

            if (!command_name) {
                const similar_commands = this.find_similar_commands(
                    request.name
                );

                const no_such_command_message =
                    similar_commands.length > 0
                        ? `sorry, no such command. Did you mean \`${similar_commands[0]}\`?`
                        : "sorry, no such command.";

                return CommandResponse.Error(no_such_command_message);
            }

            return await this.commands.get(command_name)!.execute(request);
        }
    }

    private find_similar_commands(command_name: string): string[] {
        const command_names = [...this.routes.keys(), "help"];
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

class CommandResponseCommandList extends CommandResponseHelp {
    constructor(public readonly commands: AnyCommand[]) {
        super();
    }

    to_embed(): MessageEmbed {
        const format_command = ({ meta: { name, aliases } }: AnyCommand) =>
            `・${name}` + (aliases ? ` *(${aliases.join(", ")})*` : "");

        return super
            .to_embed()
            .setTitle("Available commands")
            .setDescription(this.commands.map(format_command).sort().join("\n"))
            .setFooter(`Use "help <command>" for more information.`);
    }
}
