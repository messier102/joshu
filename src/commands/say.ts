import { ValidatedRequest } from "../core/request";
import { Command } from "../core/command";
import { pSnowflake } from "../core/parsers/Snowflake";
import { pString } from "../core/parsers/String";
import { Response } from "../core/response";
import { Parameter } from "../core/parameter";

export default new Command(
    {
        name: "say",
        description: "Posts the given message in the given channel.",

        parameters: [
            new Parameter({
                name: "target channel id",
                parser: pSnowflake,
                description: "The channel to post the message to.",
                examples: ["836905661819256862"],
            }),
            new Parameter({
                name: "message",
                parser: pString,
                description: "The message to post.",
                examples: ["Ahh what a beautiful day", "yep cock"],
            }),
        ],
        permissions: [],

        accept_remainder_arg: true,
    },

    async (
        { source }: ValidatedRequest,
        target_channel_id: string,
        message: string
    ) => {
        const target_channel = await source.client.channels.fetch(
            target_channel_id
        );
        if (!target_channel || !target_channel.isText()) {
            return Response.Error("this doesn't seem to be a valid channel");
        }

        target_channel.send(message);
        return Response.Ok("Message sent.");
    }
);
