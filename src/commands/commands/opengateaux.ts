import { CommandRequest } from "../request";
import { CommandParameter, Command } from "../command";
import { Permissions } from "discord.js";
import StringConverter from "../type_converters/StringConverter";
import snoowrap from "snoowrap";
import config from "../../../data/config";

const reddit = new snoowrap(config.reddit);

export default <Command>{
    parameters: [new CommandParameter("post title", StringConverter)],
    permissions: [Permissions.FLAGS.CREATE_INSTANT_INVITE],

    execute({ source }: CommandRequest, post_title: string): void {
        source.guild?.systemChannel
            ?.createInvite({
                unique: true,
            })
            .then((invite) => {
                if (!(invite && invite.url)) {
                    console.log("unable to create invite");
                    throw new Error("unable to create invite");
                }

                return reddit
                    .submitLink({
                        subredditName: "discordservers",
                        title: post_title,
                        url: invite.url,
                    })
                    .then((post) => post.fetch())
                    .then((post) => post.unmarkNsfw())
                    .then((post) =>
                        source.channel.send(
                            `Opened the gates: https://www.reddit.com${post.permalink}`
                        )
                    )
                    .catch((reason) => {
                        source.reply(`Reddit error: \`${reason.toString()}\``);
                        console.log(reason);
                    });
            });
    },
};
