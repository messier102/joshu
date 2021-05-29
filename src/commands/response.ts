import { MessageEmbed } from "discord.js";

export interface CommandResponse {
    to_embed(): MessageEmbed;
}

class Ok implements CommandResponse {
    constructor(public message: string) {}

    to_embed(): MessageEmbed {
        return new MessageEmbed()
            .setColor("GREEN")
            .setDescription(this.message);
    }
}

class Error implements CommandResponse {
    constructor(public message: string) {}

    to_embed(): MessageEmbed {
        return new MessageEmbed()
            .setColor("RED")
            .addField("Error", this.message);
    }
}

export const CommandResponse = {
    Ok(message: string): CommandResponse {
        return new Ok(message);
    },

    Error(message: string): CommandResponse {
        return new Error(message);
    },
};
