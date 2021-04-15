import Discord from "discord.js";

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

    const args = message.content.slice(prefix.length).split(" ");
    const [command, ...command_args] = args;

    if (command === "ping") {
        message.channel.send("pong");
    }
});

client.login(DISCORD_TOKEN);
