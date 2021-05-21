import { CommandRequest } from "./commands/request";
import { CommandRouter } from "./commands/router";
import Discord from "discord.js";
import config from "../data/config";

const client = new Discord.Client();
const command_router = new CommandRouter();

client.on("ready", () => {
    console.log(`Logged in as ${client.user?.tag}`);
});

client.on("message", (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;

    CommandRequest.from_raw_message(message, config.prefix)
        .map((request) => command_router.route_request(request))
        .mapErr((error) => message.channel.send(error.message));
});

client.login(config.discord_token);
