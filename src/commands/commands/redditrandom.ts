import { CommandRequest } from "../request";
import { CommandParameter, Command } from "../command";
import snoowrap from "snoowrap";

import config from "../../../data/config";
import StringConverter from "../type_converters/StringConverter";

const reddit = new snoowrap(config.reddit);

export default <Command>{
    parameters: [new CommandParameter("subreddit", StringConverter)],
    permissions: [],

    execute({ source }: CommandRequest, subreddit: string): void {
        reddit
            .getRandomSubmission(subreddit)
            .then((post) =>
                source.channel.send(
                    `Random reddit post from \`r/${subreddit}\`:\nhttps://www.reddit.com${post.permalink}`
                )
            );
    },
};
