import { CommandRequest } from "../request";
import { CommandParameter, Command } from "../command";
import SnowflakeConverter from "../type_converters/SnowflakeConverter";
import StringConverter from "../type_converters/StringConverter";

export default <Command>{
    parameters: [
        new CommandParameter("target channel id", SnowflakeConverter),
        new CommandParameter("message", StringConverter),
    ],
    permissions: [],

    accept_remainder: true,

    can_execute({ source }, target_channel_id: string): boolean {
        const target_channel = source.client.channels.cache.get(
            target_channel_id
        );

        return target_channel?.isText() ?? false;
    },

    execute(
        { source }: CommandRequest,
        target_channel_id: string,
        message: string
    ): void {
        const target_channel = source.client.channels.cache.get(
            target_channel_id
        );
        if (!target_channel) return;
        if (!target_channel.isText()) return;

        target_channel.send(message);
    },
};
