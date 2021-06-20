import { Request } from "./request";
import { AnyCommand } from "./command";
import { Response, ResponseError } from "./response";
import { MessageEmbed } from "discord.js";
import { CommandNameResolver } from "./resolver";
import { HelpCommand } from "./help";

export class Router {
    readonly resolver: CommandNameResolver;

    constructor(private readonly commands: AnyCommand[]) {
        this.resolver = new CommandNameResolver([
            ...commands,
            HelpCommand(this) as AnyCommand,
        ]);
    }

    async route(request: Request): Promise<Response> {
        const maybe_command = this.resolver.resolve(request.name);

        return maybe_command
            .map((command) => command.execute(request))
            .mapErr((suggestion) => new CommandResponseNotFound(suggestion))
            .val;
    }
}

export class CommandResponseNotFound extends ResponseError {
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
