import { CommandRequest } from "../request";
import { CommandParameter, Command } from "../command";
import RedditClient from "snoots";
import config from "../../../data/config";
import StringConverter from "../type_converters/StringConverter";

const reddit = new RedditClient(config.reddit.client);

export default <Command>{
    parameters: [new CommandParameter("subreddit", StringConverter)],
    permissions: [],

    async execute(
        { source }: CommandRequest,
        subreddit: string
    ): Promise<void> {
        try {
            const random_post = await reddit.subreddits.getRandomPost(
                subreddit
            );

            source.channel.send(
                `Random reddit post from \`r/${subreddit}\`:\nhttps://www.reddit.com${random_post.permalink}`
            );
        } catch (e) {
            source.reply("sorry, couldn't fetch that subreddit.");
        }
    },
};
