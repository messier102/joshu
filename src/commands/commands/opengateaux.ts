import { CommandRequest } from "../request";
import { CommandParameter, Command } from "../command";
import { Permissions } from "discord.js";
import StringConverter from "../type_converters/StringConverter";
import config from "../../../data/config";
import RedditClient from "snoots";

const reddit = new RedditClient({
    userAgent: config.reddit.userAgent,
    creds: {
        clientId: config.reddit.clientId,
        clientSecret: config.reddit.clientSecret,
    },
    auth: {
        username: config.reddit.username,
        password: config.reddit.password,
    },
});

export default <Command>{
    parameters: [new CommandParameter("post title", StringConverter)],
    permissions: [Permissions.FLAGS.CREATE_INSTANT_INVITE],

    accept_remainder_arg: true,

    async execute(
        { source }: CommandRequest,
        post_title: string
    ): Promise<void> {
        const invite = await source.guild?.systemChannel?.createInvite({
            unique: true,
        });

        if (!invite) {
            console.log("unable to create invite");
            throw new Error("unable to create invite");
        }

        try {
            const post_id = await reddit.subreddits.postLink(
                config.subreddit,
                post_title,
                invite.url
            );

            const post = await reddit.posts.fetch(post_id);
            await post.unmarkNsfw();

            source.channel.send(
                `Opened the gates: https://www.reddit.com${post.permalink}`
            );
        } catch (reason) {
            source.reply(`Reddit error: \`${reason.toString()}\``);
            console.log(reason);
        }
    },
};
