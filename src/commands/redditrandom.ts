import { ValidatedRequest } from "../core/request";
import { Command } from "../core/command";
import { pString } from "../core/parsers/String";
import {
    absolute_url,
    is_image_post,
    post_stats,
    text_preview,
} from "../core/services/reddit";
import { Response, ResponseOk } from "../core/response";
import { Post } from "snoots";
import { MessageEmbed } from "discord.js";
import { Parameter } from "../core/parameter";
import RedditClient from "snoots";

export default (reddit: RedditClient): Command<[subreddit: string]> =>
    new Command(
        {
            name: "redditrandom",
            description:
                "Displays a random recent post from a given subreddit.",
            aliases: ["rr"],

            parameters: [
                new Parameter({
                    name: "subreddit",
                    parser: pString,
                    description: `The subreddit to get a post from, without the "r/" part.`,
                    examples: ["r4r", "makenewfriendshere", "eyebleach"],
                }),
            ],
            permissions: [],
        },

        async (_: ValidatedRequest, subreddit: string) => {
            try {
                const random_post = await reddit.subreddits.getRandomPost(
                    subreddit
                );

                return new RandomPostOk(random_post);
            } catch (e) {
                return Response.Error("Sorry, couldn't fetch that subreddit.");
            }
        }
    );

class RandomPostOk extends ResponseOk {
    constructor(public readonly post: Post) {
        super();
    }

    to_embed(): MessageEmbed {
        const post = this.post;

        const embed = super
            .to_embed()
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
