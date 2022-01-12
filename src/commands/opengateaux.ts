import { ValidatedRequest } from "../core/request";
import { Command } from "../core/command";
import { EmbedFieldData, MessageEmbed } from "discord.js";
import { pString } from "../core/parsers/String";
import config from "../../data/config";
import { absolute_url, post_stats } from "../core/services/reddit";
import { Response, ResponseOk } from "../core/response";
import { Post } from "snoots";
import { Parameter } from "../core/parameter";
import { DiscordPermission } from "../core/permissions";
import RedditClient from "snoots";

export default (reddit: RedditClient): Command<[post_title: string]> =>
    new Command(
        {
            name: "opengateaux",
            description:
                "Creates a new invite link and posts it to r/discordservers with the given title",

            parameters: [
                new Parameter({
                    name: "post title",
                    parser: pString,
                    description: "The title of the Reddit post.",
                    examples: [
                        "[21+] Cats 🐈 Coffee ☕ Bread 🍞",
                        "[21+] cute people welcome",
                        "[21+] yep cock",
                    ],
                }),
            ],
            permissions: [
                DiscordPermission.CreateInvite,
                DiscordPermission.ManageServer,
            ],

            accept_remainder_arg: true,
        },

        async ({ source }: ValidatedRequest, post_title: string) => {
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
                return Response.Error("unable to create invite");
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
                return Response.Error(`Reddit error: \`${reason}\``);
            }
        }
    );

class GateauxOpenOk extends ResponseOk {
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
