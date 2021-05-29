import { CommandRequest } from "../request";
import { Command } from "../command";
import { reddit } from "../../services/reddit";
import { CommandResponse } from "../response";
import { MessageEmbed } from "discord.js";
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

            if (posts.length > 0) {
                return new GateauxOpenOk(posts);
            } else {
                return new GateauxClosedOk();
            }
        } catch (reason) {
            return CommandResponse.Error(`Reddit error: \`${reason}\``);
        }
    },
});

class GateauxOpenOk implements CommandResponse {
    constructor(public readonly posts: Post[]) {}

    to_embed(): MessageEmbed {
        const embed = new MessageEmbed()
            .setColor("GREEN")
            .setDescription("Currently active posts:")
            .setFooter(`Use "closegateaux" to close the gates`);

        for (const post of this.posts) {
            const title = `r/${post.subreddit}・${post.title}`;

            const upvote_count = pluralize(post.score, "upvote");
            const comment_count = pluralize(post.numComments, "comment");
            const upvote_ratio = `${post.upvoteRatio * 100}% upvoted`;
            const permalink = `https://reddit.com${post.permalink}`;

            const post_info = `${upvote_count} (${upvote_ratio}), ${comment_count} ([link](${permalink}))`;

            embed.addField(title, post_info);
        }

        return embed;
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

function pluralize(amount: number, unit: string) {
    const is_plural = amount !== 1;

    return `${amount} ${unit}${is_plural ? "s" : ""}`;
}
