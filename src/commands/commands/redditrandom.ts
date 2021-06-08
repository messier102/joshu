import { ValidatedCommandRequest } from "../request";
import { CommandParameter, Command } from "../command";
import StringConverter from "../type_converters/StringConverter";
import {
    absolute_url,
    is_image_post,
    post_stats,
    reddit,
    text_preview,
} from "../../services/reddit";
import { CommandResponse, CommandResponseOk } from "../response";
import { Post } from "snoots";
import { MessageEmbed } from "discord.js";

export default Command(
    {
        aliases: ["rr"],

        parameters: [new CommandParameter("subreddit", StringConverter)],
        permissions: [],
    },

    async (_: ValidatedCommandRequest, subreddit: string) => {
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
    }
);

class RandomPostOk extends CommandResponseOk {
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
