import { Command } from "../command";
import { CommandHandler } from "./base";
import { Permissions } from "discord.js";

export default class GiveRole implements CommandHandler {
    can_handle_command(command: Command): boolean {
        return (
            command.source.member?.hasPermission(
                Permissions.FLAGS.MANAGE_ROLES
            ) ?? false
        );
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
