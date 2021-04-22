import { CommandRequest } from "../request";
import { CommandParameter, Command } from "../command";
import MentionConverter from "../type_converters/MentionConverter";
import { Permissions } from "discord.js";

export default <Command>{
    aliases: ["axe", "expire", "terminate", "delete", "uninvite"],
    parameters: [new CommandParameter("target user", MentionConverter)],
    permissions: [Permissions.FLAGS.BAN_MEMBERS],

    async execute(
        { source }: CommandRequest,
        target_user_id: string
    ): Promise<void> {
        const user = source.guild?.members.cache.get(target_user_id);
        await user?.ban();
        source.channel.send(`Banned ${user?.user.tag}`);
    },
};
