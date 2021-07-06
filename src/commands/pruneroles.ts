import { ValidatedRequest } from "../core/request";
import { Command } from "../core/command";
import { Response, ResponseWarning } from "../core/response";
import { DiscordPermission } from "../core/permissions";
import {
    MessageEmbed,
    MessageReaction,
    Role,
    TextChannel,
    User,
} from "discord.js";

export default new Command(
    {
        name: "pruneroles",
        description: "Deletes roles that aren't assigned to any user.",

        parameters: [],
        permissions: [
            DiscordPermission.ManageRoles,
            DiscordPermission.ManageMessages,
        ],

        accept_remainder_arg: true,
    },

    async ({ source }: ValidatedRequest) => {
        const unused_roles = source.guild.roles.cache.filter(
            (role) => role.members.size === 0
        );

        if (unused_roles.size === 0) {
            return Response.Ok("There are no unused roles. 👍");
        }

        const prompt_answer = await prompt_yes_no(
            source.channel as TextChannel,
            source.member.user,
            new PrunePrompt(unused_roles.array())
        );

        if (prompt_answer) {
            await Promise.all(unused_roles.map((role) => role.delete()));

            return Response.Ok(
                `Deleted **${unused_roles.size}** role${
                    unused_roles.size === 1 ? "" : "s"
                }.`
            );
        } else {
            return Response.Ok("Action canceled.");
        }
    }
);

async function prompt_yes_no(
    channel: TextChannel,
    target_user: User,
    prompt: ResponseWarning,
    timeout_ms = 60000
): Promise<boolean | undefined> {
    const answer_yes = "✅";
    const answer_no = "❌";
    const possible_answers = [answer_yes, answer_no];

    const prompt_message = await channel.send(prompt.to_embed());
    await Promise.all([
        prompt_message.react(answer_yes),
        prompt_message.react(answer_no),
    ]);

    const filter = (reaction: MessageReaction, user: User) =>
        possible_answers.includes(reaction.emoji.name) &&
        user.id === target_user.id;

    return prompt_message
        .awaitReactions(filter, {
            max: 1,
            time: timeout_ms,
            errors: ["time"],
        })
        .then(async (reactions) => {
            const reaction = reactions.first()?.emoji.name;
            return reaction === answer_yes;
        })
        .catch(async () => {
            return undefined;
        })
        .finally(() => prompt_message.delete());
}

class PrunePrompt extends ResponseWarning {
    constructor(readonly unused_roles: Role[]) {
        super();
    }

    to_embed(): MessageEmbed {
        return super
            .to_embed()
            .setTitle(
                `There ${this.unused_roles.length === 1 ? "is" : "are"} ${
                    this.unused_roles.length
                } unused role${this.unused_roles.length === 1 ? "" : "s"}`
            )
            .setDescription(
                `Are you sure you want to delete ${
                    this.unused_roles.length === 1 ? "it" : "them"
                }? *This cannot be undone.*`
            )
            .addField("Roles", this.unused_roles.join(" "));
    }
}
