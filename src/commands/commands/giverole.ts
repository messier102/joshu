import { ValidatedCommandRequest } from "../request";
import { Permissions } from "discord.js";
import { CommandParameter, Command } from "../command";
import MentionConverter from "../type_converters/MentionConverter";
import StringConverter from "../type_converters/StringConverter";
import { CommandResponse } from "../response";

export default new Command(
    {
        name: "giverole",
        description:
            "Creates a new role with the given name and color and assigns it to the given user.",

        parameters: [
            new CommandParameter(
                "target user id",
                MentionConverter,
                "The user to give a role to."
            ),
            new CommandParameter(
                "role name",
                StringConverter,
                "The name of the new role."
            ),
            new CommandParameter(
                "role color",
                StringConverter,
                "The color of the new role."
            ),
        ],
        permissions: [Permissions.FLAGS.MANAGE_ROLES],
    },

    async (
        { source }: ValidatedCommandRequest,
        target_user_id: string,
        role_name: string,
        role_color: string
    ) => {
        const target_member = await source.guild.members.fetch(target_user_id);
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
        const role = await source.guild.roles.create(role_options);

        await target_member.roles.add(role.id);

        return CommandResponse.Ok(
            `Gave ${target_member} a new role \`${role.name}\``
        );
    }
);
