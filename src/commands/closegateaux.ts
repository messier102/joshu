import { ValidatedRequest } from "../core/request";
import { Command } from "../core/command";
import { MessageEmbed, Permissions } from "discord.js";
import { reddit } from "../core/services/reddit";
import { Response, ResponseOk } from "../core/response";
import { pluralize } from "../core/util";
import dedent from "ts-dedent";

export default new Command(
    {
        name: "closegateaux",
        description: dedent`
            Deletes advertising posts created by \`opengateaux\`, as well as associated invites.
            
            You must have "Manage server" permission to use it
        `,

        parameters: [],
        permissions: [Permissions.FLAGS.MANAGE_GUILD],

        accept_remainder_arg: true,
    },

    async ({ source }: ValidatedRequest) => {
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
            return Response.Error(`Reddit error: \`${reason.toString()}\``);
        }
    }
);

class GateauxClosedOk extends ResponseOk {
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
