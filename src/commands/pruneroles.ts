import { ValidatedRequest } from "../core/request";
import { Command } from "../core/command";
import { Response, ResponseOk, ResponseWarning } from "../core/response";
import { DiscordPermission } from "../core/permissions";
import {
    MessageEmbed,
    MessageReaction,
    Role,
    TextChannel,
    User,
} from "discord.js";
import { partition } from "lodash";
import { pluralize } from "../core/util";

export default new Command(
    {
        name: "pruneroles",
        description: "Deletes roles that aren't assigned to any user.",

        parameters: [],
        permissions: [DiscordPermission.ManageRoles],

        accept_remainder_arg: true,
        suppress_typing: true,
    },

    async ({ source }: ValidatedRequest) => {
        const unused_roles = source.guild.roles.cache
            .filter((role) => role.members.size === 0)
            .array();

        if (unused_roles.length === 0) {
            return Response.Ok("There are no unused roles. 👍");
        }

        const [prunable, unprunable] = partition(
            unused_roles,
            (role) => role.editable
        );

        if (prunable.length > 0) {
            const prompt_answer = await prompt_yes_no(
                source.channel as TextChannel,
                source.member.user,
                new PrunePrompt(unused_roles, prunable, unprunable)
            );

            if (prompt_answer) {
                await Promise.all(prunable.map((role) => role.delete()));

                return Response.Ok(
                    `Deleted **${prunable.length}** role${
                        prunable.length === 1 ? "" : "s"
                    }. Total role count is now **${
                        source.guild.roles.cache.size - 1 // @everyone
                    }**.`
                );
            } else {
                return Response.Ok("Action canceled.");
            }
        } else if (unprunable.length > 0) {
            return new NoPrunableOk(unprunable);
        }

        const prompt_answer = await prompt_yes_no(
            source.channel as TextChannel,
            source.member.user,
            new PrunePrompt(unused_roles, prunable, unprunable)
        );

        if (prompt_answer) {
            await Promise.all(prunable.map((role) => role.delete()));

            return Response.Ok(
                `Deleted **${prunable.length}** role${
                    prunable.length === 1 ? "" : "s"
                }. Total role count is now **${
                    source.guild.roles.cache.size - 1 // @everyone
                }**.`
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
    constructor(
        readonly unused_roles: Role[],
        readonly prunable: Role[],
        readonly unprunable: Role[]
    ) {
        super();
    }

    to_embed(): MessageEmbed {
        const embed = super
            .to_embed()
            .setTitle(
                `Found ${pluralize(this.unused_roles.length, "unused role")}`
            )
            .setDescription(
                `Are you sure you want to prune ${
                    this.unused_roles.length === 1 ? "it" : "them"
                }? *This cannot be undone.*`
            )
            .addField(
                "This will delete the following roles",
                this.prunable.join(" ")
            );

        if (this.unprunable.length) {
            embed.addField(
                "The following roles are unused, but cannot be deleted due to role order",
                this.unprunable.join(" ")
            );
        }

        return embed;
    }
}

class NoPrunableOk extends ResponseOk {
    constructor(public readonly unprunable: readonly Role[]) {
        super();
    }

    to_embed(): MessageEmbed {
        return super
            .to_embed()
            .addField(
                `Found ${pluralize(
                    this.unprunable.length,
                    "unused role"
                )}, which can't be deleted due to role order.`,
                this.unprunable.join(" ")
            );
    }
}
