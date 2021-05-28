import { CommandRequest } from "../request";
import { CommandParameter, Command } from "../command";
import StringConverter from "../type_converters/StringConverter";
import { reddit } from "../../services/reddit";
import { Err, Ok, Result } from "ts-results";

export default Command({
    parameters: [new CommandParameter("subreddit", StringConverter)],
    permissions: [],

    async execute(
        _: CommandRequest,
        subreddit: string
    ): Promise<Result<string, string>> {
        try {
            const random_post = await reddit.subreddits.getRandomPost(
                subreddit
            );

            return Ok(
                `Random reddit post from \`r/${subreddit}\`:\nhttps://www.reddit.com${random_post.permalink}`
            );
        } catch (e) {
            return Err("sorry, couldn't fetch that subreddit.");
        }
    },
});
