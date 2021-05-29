import { CommandRequest } from "../request";
import { CommandParameter, Command } from "../command";
import SnowflakeConverter from "../type_converters/SnowflakeConverter";
import StringConverter from "../type_converters/StringConverter";
import { CommandResponse } from "../response";

export default Command({
    parameters: [
        new CommandParameter("target channel id", SnowflakeConverter),
        new CommandParameter("message", StringConverter),
    ],
    permissions: [],

    accept_remainder_arg: true,

    async execute(
        { source }: CommandRequest,
        target_channel_id: string,
        message: string
    ): Promise<CommandResponse> {
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
    },
});
