import { CommandRequest } from "../request";
import { Command } from "../command";
import { CommandResponse } from "../response";
import { Permissions } from "discord.js";
import { reddit } from "../../services/reddit";
import { Err, Ok, Result } from "ts-results";

export default Command({
    parameters: [],
    permissions: [Permissions.FLAGS.MANAGE_GUILD],

    accept_remainder_arg: true,

    async execute({
        source,
    }: CommandRequest): Promise<Result<CommandResponse, string>> {
        if (!source.guild) {
            return Err("sorry, this can only be done in a server.");
        }

        const old_invites = await source.guild.fetchInvites();
        for (const [_, old_invite] of old_invites) {
            if (old_invite.inviter === source.client.user) {
                await old_invite.delete();
            }
        }

        try {
            const bot_user = await reddit.users.fetchMe();
            const old_posts = bot_user.getPosts();

            for await (const old_post of old_posts) {
                await old_post.delete();
            }

            return Ok(
                CommandResponse.Message(
                    "Closed the gates. Sleep safe, citizen."
                )
            );
        } catch (reason) {
            console.log(reason);
            return Err(`Reddit error: \`${reason.toString()}\``);
        }
    },
});
