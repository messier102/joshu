import { MessageEmbed } from "discord.js";

export interface CommandResponse {
    to_embed(): MessageEmbed;
}

export abstract class CommandResponseOk implements CommandResponse {
    to_embed(): MessageEmbed {
        return new MessageEmbed().setColor("GREEN");
    }
}

export abstract class CommandResponseError implements CommandResponse {
    to_embed(): MessageEmbed {
        return new MessageEmbed().setColor("RED");
    }
}

class Ok extends CommandResponseOk {
    constructor(public message: string) {
        super();
    }

    to_embed(): MessageEmbed {
        return super.to_embed().setDescription(this.message);
    }
}

class Error extends CommandResponseError {
    constructor(public message: string) {
        super();
    }

    to_embed(): MessageEmbed {
        return super.to_embed().addField("Error", this.message);
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
