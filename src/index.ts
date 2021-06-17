import { CommandRequest } from "./core/request";
import { Router } from "./core/router";
import Discord from "discord.js";
import config from "../data/config";
import { CommandResponse } from "./core/response";
import path from "node:path";
import { load_commands } from "./core/loader";

(async () => {
    const commands_dir = path.join(__dirname, "commands");
    const commands = await load_commands(commands_dir);
    const router = new Router(commands);

    const client = new Discord.Client();

    client.on("ready", () => {
        console.log(`Logged in as ${client.user?.tag}`);
    });

    client.on("message", async (message) => {
        if (message.author.bot) return;
        if (!message.content.startsWith(config.prefix)) return;

        const request = CommandRequest.from_raw_message(message, config.prefix);

        if (request.ok) {
            message.channel.startTyping();
            const response = await router.route(request.val);
            message.channel.stopTyping();

            message.channel.send(response.to_embed());
        } else {
            message.channel.send(CommandResponse.Error(request.val).to_embed());
        }
    });

    client.login(config.discord_token);
})();
