import { CommandRequest } from "../request";
import { Command } from "../command";
import { reddit } from "../../services/reddit";

export default <Command>{
    parameters: [],
    permissions: [],

    accept_remainder_arg: true,

    async execute({ source }: CommandRequest): Promise<void> {
        try {
            const bot_user = await reddit.users.fetchMe();
            const posts = bot_user.getPosts();

            const post_links = [];

            for await (const post of posts) {
                post_links.push(`https://reddit.com/${post.permalink}`);
            }

            if (post_links.length > 0) {
                source.channel.send(
                    "Currently active posts:\n" + post_links.join("\n")
                );
            } else {
                source.channel.send(
                    "All gates are currently closed. Use `opengateaux` to open the gates."
                );
            }
        } catch (reason) {
            source.reply(`Reddit error: \`${reason.toString()}\``);
            console.log(reason);
        }
    },
};
