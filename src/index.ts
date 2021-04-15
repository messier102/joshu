import Discord from "discord.js";
import { Command } from "./commands/command";
import { CommandDispatcher } from "./commands/dispatch";

const DISCORD_TOKEN = process.argv[process.argv.length - 1];
const PREFIX = "!";

const client = new Discord.Client();
const command_dispatcher = new CommandDispatcher();

client.on("ready", () => {
    console.log(`Logged in as ${client.user?.tag}`);
});

client.on("message", (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const command = Command.from_raw_message(message, PREFIX);
    command_dispatcher.dispatch_to_handler(command);
});

client.login(DISCORD_TOKEN);
