import { zip } from "lodash";
import { Command } from "../command";
import { CommandHandler } from "../handler";
import { Parameter } from "../parameter";
import { SnowflakeArgument } from "../type_guards/snowflake";
import { StringArgument } from "../type_guards/string";

export default class Say implements CommandHandler {
    private readonly parameters = [
        new Parameter("channel id", new SnowflakeArgument()),
        new Parameter("message", new StringArgument()),
    ];

    usage(): string {
        return this.parameters.join(" ");
    }

    can_handle_command({ source, args }: Command): boolean {
        const args_are_valid = zip(args, this.parameters).every(
            ([arg, param]) =>
                arg && param && param.type_guard.is_valid_argument(arg)
        );
        if (!args_are_valid) return false;

        const [target_channel_id] = args;
        const target_channel = source.client.channels.cache.get(
            target_channel_id
        );

        return target_channel?.isText() ?? false;
    }

    handle_command({ source, args }: Command): void {
        const [target_channel_id, ...message] = args;

        const target_channel = source.client.channels.cache.get(
            target_channel_id
        );
        if (!target_channel) return;
        if (!target_channel.isText()) return;

        target_channel.send(message.join(" "));
    }
}
