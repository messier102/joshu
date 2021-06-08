import { CommandRequest } from "../request";
import { Permissions } from "discord.js";
import { CommandParameter, Command } from "../command";
import MentionConverter from "../type_converters/MentionConverter";
import StringConverter from "../type_converters/StringConverter";
import { CommandResponse } from "../response";

export default Command({
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
    ): Promise<CommandResponse> {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const target_member = await source.guild!.members.fetch(target_user_id);
        if (!target_member) {
            return CommandResponse.Error(
                "I can't find this user in the server."
            );
        }

        const role_options = {
            data: {
                name: role_name,
                color: role_color,
                permissions: 0,
                mentionable: true,
            },
        };
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const role = await source.guild!.roles.create(role_options);

        await target_member.roles.add(role.id);

        return CommandResponse.Ok(
            `Gave ${target_member} a new role \`${role.name}\``
        );
    },
});
