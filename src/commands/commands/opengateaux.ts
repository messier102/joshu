import { CommandRequest } from "../request";
import { CommandParameter, Command } from "../command";
import { Permissions } from "discord.js";
import StringConverter from "../type_converters/StringConverter";
import config from "../../../data/config";
import { reddit } from "../../services/reddit";
import { CommandResponse } from "../response";

export default Command({
    parameters: [new CommandParameter("post title", StringConverter)],
    permissions: [
        Permissions.FLAGS.CREATE_INSTANT_INVITE,
        Permissions.FLAGS.MANAGE_GUILD,
    ],

    accept_remainder_arg: true,

    async execute(
        { source }: CommandRequest,
        post_title: string
    ): Promise<CommandResponse> {
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

        const new_invite = await source.guild.systemChannel?.createInvite({
            unique: true,
        });

        if (!new_invite) {
            return CommandResponse.Error("unable to create invite");
        }

        try {
            const bot_user = await reddit.users.fetchMe();
            const old_posts = bot_user.getPosts();

            for await (const old_post of old_posts) {
                await old_post.delete();
            }

            const new_post_id = await reddit.subreddits.postLink(
                config.reddit.opengateaux_subreddit,
                post_title,
                new_invite.url
            );

            const new_post = await reddit.posts.fetch(new_post_id);
            await new_post.unmarkNsfw();

            return CommandResponse.Ok(
                `Opened the gates: https://www.reddit.com${new_post.permalink}`
            );
        } catch (reason) {
            console.log(reason);
            return CommandResponse.Error(
                `Reddit error: \`${reason.toString()}\``
            );
        }
    },
});
