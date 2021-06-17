import { ValidatedCommandRequest } from "../request";
import { Permissions } from "discord.js";
import { Command } from "../command";
import { pMention } from "../parsers/Mention";
import { pString } from "../parsers/String";
import { CommandResponse } from "../response";
import dedent from "ts-dedent";
import { Parameter } from "../parameter";

export default new Command(
    {
        name: "giverole",
        description: dedent`
            Creates a new role with the given name and color and assigns it to the given user.
            
            You must have "Manage roles" permission to use it.
        `,

        parameters: [
            new Parameter({
                name: "target user",
                parser: pMention,
                description: "The user to give a role to.",
                examples: ["@yuna", "@Momo", "@dip", "@assblaster69"],
            }),
            new Parameter({
                name: "role name",
                parser: pString,
                description: "The name of the new role.",
                examples: [`"certified friend of dip"`, "gorilla", "cutie"],
            }),
            new Parameter({
                name: "role color",
                parser: pString,
                description:
                    "The color of the new role, either a hex code or a default Discord color name in all caps (RED, BLUE, ORANGE, etc).",
                examples: ["RED", "#f3dda1", "3e3455"],
            }),
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
