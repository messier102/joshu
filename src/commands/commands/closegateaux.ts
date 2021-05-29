import { CommandRequest } from "../request";
import { Command } from "../command";
import { Permissions } from "discord.js";
import { reddit } from "../../services/reddit";
import { CommandResponse } from "../response";

export default Command({
    parameters: [],
    permissions: [Permissions.FLAGS.MANAGE_GUILD],

    accept_remainder_arg: true,

    async execute({ source }: CommandRequest): Promise<CommandResponse> {
        if (!source.guild) {
            return CommandResponse.Error(
                "sorry, this can only be done in a server."
            );
        }

        const old_invites = await source.guild.fetchInvites();
        for (const [_, old_invite] of old_invites) {
            if (old_invite.inviter === source.client.user) {
                await old_invite.delete();
            }
        }

        try {
            const bot_user = await reddit.users.fetchMe();
            const old_posts = bot_user.getPosts();

            for await (const old_post of old_posts) {
                await old_post.delete();
            }

            return CommandResponse.Ok("Closed the gates. Sleep safe, citizen.");
        } catch (reason) {
            console.log(reason);
            return CommandResponse.Error(
                `Reddit error: \`${reason.toString()}\``
            );
        }
    },
});
