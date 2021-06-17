import { ValidatedCommandRequest } from "../request";
import { Parameter, Command } from "../command";
import { pSnowflake } from "../parsers/Snowflake";
import { pString } from "../parsers/String";
import { CommandResponse } from "../response";

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
        { source }: ValidatedCommandRequest,
        target_channel_id: string,
        message: string
    ) => {
        const target_channel = await source.client.channels.fetch(
            target_channel_id
        );
        if (!target_channel || !target_channel.isText()) {
            return CommandResponse.Error(
                "this doesn't seem to be a valid channel"
            );
        }

        target_channel.send(message);
        return CommandResponse.Ok("Message sent.");
    }
);
