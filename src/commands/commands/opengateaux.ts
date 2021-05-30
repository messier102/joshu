import { CommandRequest } from "../request";
import { CommandParameter, Command } from "../command";
import { EmbedFieldData, MessageEmbed, Permissions } from "discord.js";
import StringConverter from "../type_converters/StringConverter";
import config from "../../../data/config";
import { absolute_url, post_stats, reddit } from "../../services/reddit";
import { CommandResponse, CommandResponseOk } from "../response";
import { Post } from "snoots";

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

            return new GateauxOpenOk(new_post);
        } catch (reason) {
            console.log(reason);
            return CommandResponse.Error(
                `Reddit error: \`${reason.toString()}\``
            );
        }
    },
});

class GateauxOpenOk extends CommandResponseOk {
    constructor(public readonly new_post: Post) {
        super();
    }

    to_embed(): MessageEmbed {
        return super
            .to_embed()
            .setDescription("Opened the gates:")
            .addFields(this.render_post_field(this.new_post))
            .setFooter(`Use "gateaux" to view active posts`);
    }

    private render_post_field(post: Post): EmbedFieldData {
        return {
            name: `r/${post.subreddit}・${post.title}`,
            value: `${post_stats(post)} ([link](${absolute_url(post)}))`,
        };
    }
}
