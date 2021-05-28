import { CommandRequest } from "./commands/request";
import { CommandRouter } from "./commands/router";
import Discord from "discord.js";
import config from "../data/config";

const client = new Discord.Client();
const command_router = new CommandRouter();

function response_ok_embed(message: string): Discord.MessageEmbed {
    return new Discord.MessageEmbed().setColor("GREEN").setDescription(message);
}

function response_error_embed(message: string): Discord.MessageEmbed {
    return new Discord.MessageEmbed()
        .setColor("RED")
        .addField("Error", message);
}

client.on("ready", () => {
    console.log(`Logged in as ${client.user?.tag}`);
});

client.on("message", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;

    const request = CommandRequest.from_raw_message(message, config.prefix);

    if (request.ok) {
        const response = await command_router.route_request(request.val);

        const embed = response
            .map(response_ok_embed)
            .mapErr(response_error_embed).val;

        message.channel.send(embed);
    } else {
        message.channel.send(response_error_embed(request.val));
    }
});

client.login(config.discord_token);
