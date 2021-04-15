import { CommandHandler } from "../router";

const say: CommandHandler = ({ args, source }) => {
    const [target_channel_id, ...message] = args;

    const target_channel = source.client.channels.cache.get(target_channel_id);
    if (!target_channel) return;
    if (!target_channel.isText()) return;

    target_channel.send(message.join(" "));
};

export default say;
