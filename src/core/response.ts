import { MessageEmbed } from "discord.js";

export interface Response {
    to_embed(): MessageEmbed;
}

export abstract class ResponseOk implements Response {
    to_embed(): MessageEmbed {
        return new MessageEmbed().setColor("GREEN");
    }
}

export abstract class ResponseError implements Response {
    to_embed(): MessageEmbed {
        return new MessageEmbed().setColor("RED");
    }
}

export abstract class ResponseWarning implements Response {
    to_embed(): MessageEmbed {
        return new MessageEmbed().setColor("#EEC800");
    }
}

export abstract class ResponseHelp implements Response {
    to_embed(): MessageEmbed {
        return new MessageEmbed()
            .setColor("BLUE")
            .setThumbnail("https://b.catgirlsare.sexy/9fzZ6gjI.png");
    }
}

class Ok extends ResponseOk {
    constructor(public message: string) {
        super();
    }

    to_embed(): MessageEmbed {
        return super.to_embed().setDescription(this.message);
    }
}

class Error extends ResponseError {
    constructor(public message: string) {
        super();
    }

    to_embed(): MessageEmbed {
        return super.to_embed().addField("Error", this.message);
    }
}

export const Response = {
    Ok(message: string): Response {
        return new Ok(message);
    },

    Error(message: string): Response {
        return new Error(message);
    },
};
