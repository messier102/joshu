import { ValidatedCommandRequest } from "../request";
import { Command } from "../command";
import { MessageEmbed, Permissions } from "discord.js";
import { reddit } from "../../services/reddit";
import { CommandResponse, CommandResponseOk } from "../response";
import { pluralize } from "../../util";

export default Command({
    parameters: [],
    permissions: [Permissions.FLAGS.MANAGE_GUILD],

    accept_remainder_arg: true,

    async execute({
        source,
    }: ValidatedCommandRequest): Promise<CommandResponse> {
        let total_invite_uses = 0;
        const old_invites = await source.guild.fetchInvites();
        for (const [_, old_invite] of old_invites) {
            if (old_invite.inviter === source.client.user) {
                total_invite_uses += old_invite.uses ?? 0;
                await old_invite.delete();
            }
        }

        try {
            const bot_user = await reddit.users.fetchMe();
            const old_posts = bot_user.getPosts();

            for await (const old_post of old_posts) {
                await old_post.delete();
            }

            return new GateauxClosedOk(total_invite_uses);
        } catch (reason) {
            console.log(reason);
            return CommandResponse.Error(
                `Reddit error: \`${reason.toString()}\``
            );
        }
    },
});

class GateauxClosedOk extends CommandResponseOk {
    constructor(public readonly total_invite_uses: number) {
        super();
    }

    to_embed(): MessageEmbed {
        return super
            .to_embed()
            .setDescription("Closed the gates. Sleep safe, citizen.")
            .setFooter(
                `Invites used ${pluralize(
                    this.total_invite_uses,
                    "time"
                )} today`
            );
    }
}
