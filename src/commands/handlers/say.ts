import { Command } from "../command";
import { CommandHandler } from "./base";

export default class Say implements CommandHandler {
    can_handle_command({
        source,
        args: [target_channel_id],
    }: Command): boolean {
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
