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

    const request = CommandRequest.from_raw_message(message, config.prefix);
    command_router.route_request(request);
});

client.login(config.discord_token);
