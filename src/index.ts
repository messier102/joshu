import { Command } from "./commands/command";
import { CommandRouter } from "./commands/router";
import Discord from "discord.js";
import config from "../data/config";

const client = new Discord.Client();
const command_router = new CommandRouter();

client.on("ready", () => {
    console.log(`Logged in as ${client.user?.tag}`);
});

client.on("message", (message) => {
    // temporary security measure
    if (message.author.id !== config.owner_id) return;

    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;

    const command = Command.from_raw_message(message, config.prefix);
    command_router.route_to_handler(command);
});

client.login(config.discord_token);
