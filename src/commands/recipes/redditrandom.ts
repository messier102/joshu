import { CommandRequest } from "../request";
import { CommandParameter, CommandRecipe } from "../recipe";
import snoowrap from "snoowrap";

import config from "../../../data/config";
import StringConverter from "../type_converters/StringConverter";

const reddit = new snoowrap(config.reddit);

export default <CommandRecipe>{
    parameters: [new CommandParameter("subreddit", StringConverter)],
    permissions: [],

    execute({ source }: CommandRequest, subreddit: string): void {
        source.channel.startTyping();

        reddit
            .getRandomSubmission(subreddit)
            .then((post) =>
                source.channel.send(
                    `Random reddit post from \`r/${subreddit}\`:\nhttps://www.reddit.com${post.permalink}`
                )
            )
            .finally(() => source.channel.stopTyping());
    },
};
