import { Command } from "../command";
import { CommandHandler } from "../handler";
import { Permissions } from "discord.js";
import { StringArgument } from "../type_guards/string";
import { MentionArgument } from "../type_guards/mention";
import { zip } from "lodash";
import { Parameter } from "../parameter";

export default class GiveRole implements CommandHandler {
    private readonly parameters = [
        new Parameter("target user", new MentionArgument()),
        new Parameter("role name", new StringArgument()),
        new Parameter("role color", new StringArgument()),
    ];

    usage(): string {
        return this.parameters.join(" ");
    }

    can_handle_command({ args, source }: Command): boolean {
        const args_are_valid = zip(args, this.parameters).every(
            ([arg, param]) =>
                arg && param && param.type_guard.is_valid_argument(arg)
        );

        const has_permission =
            source.member?.hasPermission(Permissions.FLAGS.MANAGE_ROLES) ??
            false;

        return args_are_valid && has_permission;
    }

    async handle_command({ args, source }: Command): Promise<void> {
        const [target_user_mention, role_name, role_color] = args;

        const target_user_id = user_id_from_mention(target_user_mention);
        if (!target_user_id) return;

        const target_member = source.guild?.members.cache.get(target_user_id);
        if (!target_member) return;

        const role_options = {
            data: {
                name: role_name,
                color: role_color,
                permissions: 0,
                mentionable: true,
            },
        };
        const role = await source.guild?.roles.create(role_options);
        if (!role) return;

        target_member.roles.add(role.id).then(() => {
            source.channel.send(
                `Gave ${target_member} a new role \`${role.name}\``
            );
        });
    }
}

function user_id_from_mention(mention: string): string | null {
    const mention_regex = /<@!(\d+)>/;
    const match = mention.match(mention_regex);

    return match && match[1];
}
