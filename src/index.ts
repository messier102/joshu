import Discord from "discord.js";
import { Command, command_handlers } from "./commands";

const client = new Discord.Client();

const DISCORD_TOKEN = process.argv[process.argv.length - 1];
const prefix = "!";

client.on("ready", () => {
    console.log(`Logged in as ${client.user?.tag}`);
});

client.on("message", (message) => {
    // ignore bot messages
    if (message.author.bot) return;

    // ignore messages not addressed to us
    if (!message.content.startsWith(prefix)) return;

    const command = Command.from_raw_message(message, prefix);

    dispatch_command_to_handler(command);
});

function dispatch_command_to_handler(command: Command): void {
    if (command.name in command_handlers) {
        const command_handler = command_handlers[command.name];

        command_handler(command);
    } else {
        command.source.reply("sorry, no such command.");
    }
}

client.login(DISCORD_TOKEN);
