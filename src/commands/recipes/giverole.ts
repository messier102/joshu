import { CommandRequest } from "../request";
import { Permissions } from "discord.js";
import { CommandParameter, CommandRecipe } from "../recipe";
import MentionConverter from "../type_converters/MentionConverter";
import StringConverter from "../type_converters/StringConverter";

export default <CommandRecipe>{
    parameters: [
        new CommandParameter("target user id", MentionConverter),
        new CommandParameter("role name", StringConverter),
        new CommandParameter("role color", StringConverter),
    ],
    permissions: [Permissions.FLAGS.MANAGE_ROLES],

    async execute(
        { source }: CommandRequest,
        target_user_id: string,
        role_name: string,
        role_color: string
    ): Promise<void> {
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
    },
};
