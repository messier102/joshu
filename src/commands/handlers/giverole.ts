import { CommandHandler } from "../router";
import { Permissions } from "discord.js";

const giverole: CommandHandler = async ({ args, source }) => {
    if (!source.member?.hasPermission(Permissions.FLAGS.MANAGE_ROLES)) {
        source.reply(
            "sorry, you don't have sufficient permissions for that. (Missing: `Manage roles`)"
        );
        return;
    }

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
};

function user_id_from_mention(mention: string): string | null {
    const mention_regex = /<@!(\d+)>/;
    const match = mention.match(mention_regex);

    return match && match[1];
}

export default giverole;
