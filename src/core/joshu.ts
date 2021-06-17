import Discord from "discord.js";
import { Request } from "./request";
import { Router } from "./router";
import { Response } from "./response";
import { load_commands } from "./loader";
import { AnyCommand } from "./command";

export class Joshu {
    private readonly client: Discord.Client;
    private readonly router: Router;

    private constructor(
        private readonly prefix: string,
        commands: AnyCommand[]
    ) {
        this.router = new Router(commands);

        this.client = new Discord.Client();
        this.client.on("ready", this.handle_ready.bind(this));
        this.client.on("message", this.handle_message.bind(this));
    }

    static async with(prefix: string, commands_dir: string): Promise<Joshu> {
        const commands = await load_commands(commands_dir);

        return new Joshu(prefix, commands);
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
            message.channel.startTyping();
            const response = await this.router.route(request.val);
            message.channel.stopTyping();

            message.channel.send(response.to_embed());
        } else {
            message.channel.send(Response.Error(request.val).to_embed());
        }
    }
}
