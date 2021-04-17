import { zip } from "lodash";
import { Command } from "../command";
import { CommandHandler } from "../handler";
import { SnowflakeArgument } from "../type_guards/snowflake";
import { StringArgument } from "../type_guards/string";

export default class Say implements CommandHandler {
    private readonly arg_guards = [
        new SnowflakeArgument(), // channel id
        new StringArgument(), // message
    ];

    usage(): string {
        return this.arg_guards.map((guard) => `<${guard.type}>`).join(" ");
    }

    can_handle_command({ source, args }: Command): boolean {
        const args_are_valid = zip(args, this.arg_guards).every(
            ([arg, arg_guard]) =>
                arg && arg_guard && arg_guard.is_valid_argument(arg)
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
