import { CommandRequest } from "../request";
import { Command } from "../command";
import { reddit } from "../../services/reddit";
import { Err, Ok, Result } from "ts-results";
import { CommandResponse } from "../response";

export default Command({
    parameters: [],
    permissions: [],

    accept_remainder_arg: true,

    async execute(_: CommandRequest): Promise<Result<CommandResponse, string>> {
        try {
            const bot_user = await reddit.users.fetchMe();
            const posts = bot_user.getPosts();

            const post_links = [];

            for await (const post of posts) {
                post_links.push(`https://reddit.com${post.permalink}`);
            }

            if (post_links.length > 0) {
                return Ok(
                    CommandResponse.Message(
                        "Currently active posts:\n" + post_links.join("\n")
                    )
                );
            } else {
                return Ok(
                    CommandResponse.Message(
                        "All gates are currently closed. Use `opengateaux` to open the gates."
                    )
                );
            }
        } catch (reason) {
            console.log(reason);
            return Err(`Reddit error: \`${reason.toString()}\``);
        }
    },
});
