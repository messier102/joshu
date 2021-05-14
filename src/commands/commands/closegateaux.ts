import { CommandRequest } from "../request";
import { Command } from "../command";
import { Permissions } from "discord.js";
import { reddit } from "../../services/reddit";

export default <Command>{
    parameters: [],
    permissions: [Permissions.FLAGS.MANAGE_GUILD],

    accept_remainder_arg: true,

    async execute({ source }: CommandRequest): Promise<void> {
        if (!source.guild) {
            source.reply("sorry, this can only be done in a server.");
            return;
        }

        const old_invites = await source.guild.fetchInvites();
        for (const [_, old_invite] of old_invites) {
            if (old_invite.inviter === source.client.user) {
                old_invite.delete();
            }
        }

        try {
            const bot_user = await reddit.users.fetchMe();
            const old_posts = bot_user.getPosts();

            for await (const old_post of old_posts) {
                await old_post.delete();
            }

            source.channel.send("Closed the gates. Sleep safe, citizen.");
        } catch (reason) {
            source.reply(`Reddit error: \`${reason.toString()}\``);
            console.log(reason);
        }
    },
};
