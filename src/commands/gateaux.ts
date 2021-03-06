import { Command } from "../core/command";
import { absolute_url, post_stats } from "../core/services/reddit";
import { Response, ResponseOk } from "../core/response";
import { EmbedFieldData, MessageEmbed } from "discord.js";
import type { Post } from "snoots";
import RedditClient from "snoots";

export default (reddit: RedditClient): Command<[]> =>
    new Command(
        {
            name: "gateaux",
            description:
                "Displays the information about currently active Reddit advertising posts created by `opengateaux`.",

            parameters: [],
            permissions: [],
        },

        async () => {
            try {
                const bot_user = await reddit.users.fetchMe();
                const posts_listing = bot_user.getPosts();

                const posts = [];
                for await (const post of posts_listing) {
                    posts.push(post);
                }

                return posts.length > 0
                    ? new GateauxOpenOk(posts)
                    : new GateauxClosedOk();
            } catch (reason) {
                return Response.Error(`Reddit error: \`${reason}\``);
            }
        }
    );

class GateauxOpenOk extends ResponseOk {
    constructor(public readonly posts: Post[]) {
        super();
    }

    to_embed(): MessageEmbed {
        return super
            .to_embed()
            .setDescription("Currently active posts:")
            .addFields(this.posts.map(this.render_post_field))
            .setFooter(`Use "closegateaux" to close the gates`);
    }

    private render_post_field(post: Post): EmbedFieldData {
        const post_title = `r/${post.subreddit}・${post.title}`;

        return {
            name: post.removed ? `[REMOVED] ~~${post_title}~~` : post_title,
            value: `${post_stats(post)} ([link](${absolute_url(post)}))`,
        };
    }
}

class GateauxClosedOk extends ResponseOk {
    to_embed(): MessageEmbed {
        return super
            .to_embed()
            .setDescription("All gates are currently closed.")
            .setFooter(`Use "opengateaux" to open the gates`);
    }
}
