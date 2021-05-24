import { CommandRequest } from "../request";
import { Permissions } from "discord.js";
import { CommandParameter, Command } from "../command";
import MentionConverter from "../type_converters/MentionConverter";
import StringConverter from "../type_converters/StringConverter";
import { Err, Ok, Result } from "ts-results";
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
    ): Promise<Result<CommandResponse, string>> {
        if (!source.guild) {
            return Err("this can only be done in a server.");
        }

        const target_member = source.guild.members.cache.get(target_user_id);
        if (!target_member) {
            return Err("I can't find this user in the server.");
        }

        const role_options = {
            data: {
                name: role_name,
                color: role_color,
                permissions: 0,
                mentionable: true,
            },
        };
        const role = await source.guild.roles.create(role_options);

        await target_member.roles.add(role.id);

        return Ok(
            CommandResponse.Send(
                `Gave ${target_member} a new role \`${role.name}\``
            )
        );
    },
});
