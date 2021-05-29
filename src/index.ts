import { CommandRequest } from "./commands/request";
import { CommandRouter } from "./commands/router";
import Discord from "discord.js";
import config from "../data/config";
import { CommandResponse } from "./commands/response";

const client = new Discord.Client();
const command_router = new CommandRouter();

client.on("ready", () => {
    console.log(`Logged in as ${client.user?.tag}`);
});

client.on("message", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;

    const request = CommandRequest.from_raw_message(message, config.prefix);

    if (request.ok) {
        const response = await command_router.route_request(request.val);

        message.channel.send(response.to_embed());
    } else {
        message.channel.send(CommandResponse.Error(request.val).to_embed());
    }
});

client.login(config.discord_token);
