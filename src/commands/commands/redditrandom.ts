import { CommandRequest } from "../request";
import { CommandParameter, Command } from "../command";
import StringConverter from "../type_converters/StringConverter";
import { reddit } from "../../services/reddit";
import { CommandResponse } from "../response";
import { Post } from "snoots";
import { MessageEmbed } from "discord.js";

export default Command({
    aliases: ["rr"],

    parameters: [new CommandParameter("subreddit", StringConverter)],
    permissions: [],

    async execute(
        _: CommandRequest,
        subreddit: string
    ): Promise<CommandResponse> {
        try {
            const random_post = await reddit.subreddits.getRandomPost(
                subreddit
            );

            return new RandomPostOk(random_post);
        } catch (e) {
            return CommandResponse.Error(
                "Sorry, couldn't fetch that subreddit."
            );
        }
    },
});

class RandomPostOk implements CommandResponse {
    constructor(public readonly post: Post) {}

    to_embed(): MessageEmbed {
        const post = this.post;

        const embed = new MessageEmbed()
            .setColor("GREEN")
            .setAuthor(`Random post from r/${post.subreddit}`)
            .setTitle(`r/${post.subreddit}・${post.title}`)
            .setURL(absolute_url(post))
            .setDescription(text_preview(post, 300))
            .setFooter(post_stats(post));

        if (is_image_post(post)) {
            embed.setImage(post.url);
        }

        return embed;
    }
}

function absolute_url(post: Post) {
    return `https://reddit.com${post.permalink}`;
}

function post_stats(post: Post): string {
    const upvote_count = pluralize(post.score, "upvote");
    const comment_count = pluralize(post.numComments, "comment");
    const upvote_ratio = `${post.upvoteRatio * 100}% upvoted`;

    return `${upvote_count} (${upvote_ratio}), ${comment_count}`;
}

function text_preview(post: Post, max_length: number): string {
    return post.body.length > max_length
        ? post.body.slice(0, max_length).trimEnd() +
              `... ([read\u00A0more](${absolute_url(post)}))` // non-breaking space
        : post.body;
}

function is_image_post(post: Post): boolean {
    if (post.isSelf) {
        return false;
    }

    const image_extensions = ["jpg", "png", "gif"];
    return image_extensions.some((ext) => post.url.endsWith(`.${ext}`));
}

function pluralize(amount: number, unit: string) {
    const is_plural = amount !== 1;

    return `${amount} ${unit}${is_plural ? "s" : ""}`;
}
