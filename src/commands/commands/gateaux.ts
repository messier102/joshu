import { CommandRequest } from "../request";
import { Command } from "../command";
import { absolute_url, post_stats, reddit } from "../../services/reddit";
import { CommandResponse } from "../response";
import { EmbedFieldData, MessageEmbed } from "discord.js";
import type { Post } from "snoots";

export default Command({
    parameters: [],
    permissions: [],

    async execute(_: CommandRequest): Promise<CommandResponse> {
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
            return CommandResponse.Error(`Reddit error: \`${reason}\``);
        }
    },
});

class GateauxOpenOk implements CommandResponse {
    constructor(public readonly posts: Post[]) {}

    to_embed(): MessageEmbed {
        return new MessageEmbed()
            .setColor("GREEN")
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

class GateauxClosedOk implements CommandResponse {
    to_embed(): MessageEmbed {
        return new MessageEmbed()
            .setColor("GREEN")
            .setDescription("All gates are currently closed.")
            .setFooter(`Use "opengateaux" to open the gates`);
    }
}
