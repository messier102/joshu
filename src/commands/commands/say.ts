import { ValidatedCommandRequest } from "../request";
import { CommandParameter, Command } from "../command";
import SnowflakeConverter from "../type_converters/SnowflakeConverter";
import StringConverter from "../type_converters/StringConverter";
import { CommandResponse } from "../response";

export default new Command(
    {
        name: "say",
        description: "Posts the given message in the given channel.",

        parameters: [
            new CommandParameter(
                "target channel id",
                SnowflakeConverter,
                "The channel to post the message to."
            ),
            new CommandParameter(
                "message",
                StringConverter,
                "The message to post."
            ),
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
