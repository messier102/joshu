import { Request } from "./request";
import { AnyCommand } from "./command";
import { find_similar_string, Weights } from "./find_similar_string";
import { Response, ResponseError, ResponseHelp } from "./response";
import { MessageEmbed } from "discord.js";
import { Err, Ok, Result } from "ts-results";

export class Router {
    private readonly resolver: RouteResolver;

    constructor(commands: AnyCommand[]) {
        this.resolver = new RouteResolver(commands);
    }

    async route(request: Request): Promise<Response> {
        if (request.name === "help") {
            return this.handle_help(request.args);
        } else {
            const maybe_command = this.resolver.resolve(request.name);

            return maybe_command
                .map((command) => command.execute(request))
                .mapErr((suggestion) => new CommandResponseNotFound(suggestion))
                .val;
        }
    }

    handle_help(command_name: string | undefined): Response {
        if (command_name) {
            const maybe_command = this.resolver.resolve(command_name);

            return maybe_command
                .map((command) => command.help(command_name))
                .mapErr((suggestion) => new CommandResponseNotFound(suggestion))
                .val;
        } else {
            return new CommandResponseCommandList([...this.resolver.commands]);
        }
    }
}

class RouteResolver {
    private readonly routes: Map<string, AnyCommand> = new Map();

    constructor(public readonly commands: AnyCommand[]) {
        for (const command of commands) {
            this.routes.set(command.meta.name, command);

            if (command.meta.aliases) {
                for (const alias of command.meta.aliases) {
                    if (this.routes.has(alias)) {
                        console.log(`Alias collision: ${alias} already exists`);
                    }

                    this.routes.set(alias, command);
                }
            }

            console.log("Configured routes:");
            console.log(this.routes);
        }
    }

    resolve(command_name: string): Result<AnyCommand, string | undefined> {
        const maybe_command = this.routes.get(command_name);

        if (maybe_command) {
            return Ok(maybe_command);
        } else {
            const similar_commands = this.find_similar_commands(command_name);

            return Err(similar_commands[0]);
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

class CommandResponseNotFound extends ResponseError {
    constructor(public readonly command_suggestion: string | undefined) {
        super();
    }

    to_embed(): MessageEmbed {
        return super
            .to_embed()
            .setDescription(
                "Sorry, no such command." +
                    (this.command_suggestion
                        ? ` Did you mean \`${this.command_suggestion}\`?`
                        : "")
            );
    }
}

class CommandResponseCommandList extends ResponseHelp {
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
