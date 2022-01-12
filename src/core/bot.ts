import Discord from "discord.js";
import { Request } from "./request";
import { Response } from "./response";
import { AnyCommand } from "./command";
import { CommandNameResolver, CommandResponseNotFound } from "./resolver";
import { HelpCommand } from "./help";

export class Bot {
    private readonly client: Discord.Client;
    private readonly resolver: CommandNameResolver;

    constructor(private readonly prefix: string, commands: AnyCommand[]) {
        this.resolver = new CommandNameResolver();
        const help_command = HelpCommand(this.resolver);

        this.resolver.register_commands(
            help_command as AnyCommand,
            ...commands
        );

        this.client = new Discord.Client();
        this.client.on("ready", this.handle_ready.bind(this));
        this.client.on("message", this.handle_message.bind(this));
    }

    async run(discord_token: string): Promise<void> {
        this.client.login(discord_token);
    }

    private handle_ready() {
        console.log(`Logged in as ${this.client.user?.tag}`);
    }

    private async handle_message(message: Discord.Message) {
        if (message.author.bot) return;
        if (!message.content.startsWith(this.prefix)) return;

        const request = Request.from_raw_message(message, this.prefix);

        if (request.ok) {
            const maybe_command = this.resolver.resolve(request.val.name);

            const response = await maybe_command
                .map((command) => {
                    if (!command.meta.suppress_typing) {
                        message.channel.startTyping();
                    }

                    const result = command.execute(request.val);

                    message.channel.stopTyping();

                    return result;
                })
                .mapErr((suggestion) => new CommandResponseNotFound(suggestion))
                .val;

            message.channel.send(response.to_embed());
        } else {
            message.channel.send(Response.Error(request.val).to_embed());
        }
    }
}
