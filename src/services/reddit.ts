import RedditClient, { Post } from "snoots";
import config from "../../data/config";
import { pluralize } from "../core/util";

export const reddit = new RedditClient(config.reddit.client);

export function absolute_url(post: Post): string {
    return "https://reddit.com" + post.permalink;
}

export function post_stats(post: Post): string {
    const upvote_count = pluralize(post.score, "upvote");
    const comment_count = pluralize(post.numComments, "comment");
    const upvote_ratio = `${post.upvoteRatio * 100}% upvoted`;

    return `${upvote_count} (${upvote_ratio}), ${comment_count}`;
}

export function text_preview(post: Post, max_length: number): string {
    return post.body.length > max_length
        ? post.body.slice(0, max_length).trimEnd() +
              `... ([read\xA0more](${absolute_url(post)}))` // non-breaking space
        : post.body;
}

export function is_image_post(post: Post): boolean {
    if (post.isSelf) {
        return false;
    }

    const image_extensions = ["jpg", "png", "gif"];
    return image_extensions.some((ext) => post.url.endsWith(`.${ext}`));
}
