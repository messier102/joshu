import { CommandRequest } from "../request";
import { Command } from "../command";
import { reddit } from "../../services/reddit";
import { CommandResponse } from "../response";

export default Command({
    parameters: [],
    permissions: [],

    accept_remainder_arg: true,

    async execute(_: CommandRequest): Promise<CommandResponse> {
        try {
            const bot_user = await reddit.users.fetchMe();
            const posts = bot_user.getPosts();

            const post_links = [];

            for await (const post of posts) {
                post_links.push(`https://reddit.com${post.permalink}`);
            }

            if (post_links.length > 0) {
                return CommandResponse.Ok(
                    "Currently active posts:\n" + post_links.join("\n")
                );
            } else {
                return CommandResponse.Ok(
                    "All gates are currently closed. Use `opengateaux` to open the gates."
                );
            }
        } catch (reason) {
            console.log(reason);
            return CommandResponse.Error(
                `Reddit error: \`${reason.toString()}\``
            );
        }
    },
});
