import { CommandRequest } from "../request";
import { CommandParameter, Command } from "../command";
import SnowflakeConverter from "../type_converters/SnowflakeConverter";
import StringConverter from "../type_converters/StringConverter";
import { Err, Ok, Result } from "ts-results";
import { CommandResponse, Empty, Reply } from "../response";

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
    ): Promise<Result<CommandResponse, string>> {
        const target_channel = source.client.channels.cache.get(
            target_channel_id
        );
        if (!target_channel || !target_channel.isText()) {
            return Err("this doesn't seem to be a valid channel.");
        }

        target_channel.send(message);
        if (target_channel !== source.channel) {
            return Ok(Reply("message sent."));
        } else {
            return Ok(Empty());
        }
    },
});
