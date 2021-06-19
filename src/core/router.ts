import { Request } from "./request";
import { AnyCommand } from "./command";
import { Response, ResponseError, ResponseHelp } from "./response";
import { MessageEmbed } from "discord.js";
import { CommandNameResolver } from "./resolver";

export class Router {
    private readonly resolver: CommandNameResolver;

    constructor(commands: AnyCommand[]) {
        this.resolver = new CommandNameResolver(commands);
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
