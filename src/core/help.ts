import { MessageEmbed, PermissionResolvable, Permissions } from "discord.js";
import { sample } from "lodash";
import config from "../../data/config";
import { AnyCommand, Command, CommandMetadata } from "./command";
import { OptionalParameter, Parameter, Parameters } from "./parameter";
import { pString } from "./parsers/String";
import { ValidatedRequest } from "./request";
import { CommandNameResolver, CommandResponseNotFound } from "./resolver";
import { ResponseHelp } from "./response";

export function HelpCommand(
    resolver: CommandNameResolver
): Command<[command?: string | undefined]> {
    return new Command(
        {
            name: "help",
            description:
                "Displays a list of available commands. If called with a command name, displays information about that particular command.",
            parameters: [
                new OptionalParameter({
                    name: "command name",
                    parser: pString,
                    description: "The command to display help for.",
                    examples: ["help", "ban", "expire"],
                }),
            ],
            permissions: [],
        },

        async (_: ValidatedRequest, command_name?: string) => {
            if (command_name) {
                const command = resolver.resolve(command_name);

                if (command.ok) {
                    return new CommandHelp(command_name, command.val.meta);
                } else {
                    const suggestion = command.val;
                    return new CommandResponseNotFound(suggestion);
                }
            } else {
                return new CommandResponseCommandList(resolver.commands);
            }
        }
    );
}

class CommandResponseCommandList extends ResponseHelp {
    constructor(public readonly commands: readonly AnyCommand[]) {
        super();
    }

    to_embed(): MessageEmbed {
        const format_command = ({ meta: { name, aliases } }: AnyCommand) =>
            `・${name}` + (aliases ? ` *(${aliases.join(", ")})*` : "");

        return super
            .to_embed()
            .setTitle("Available commands")
            .setDescription(this.commands.map(format_command).sort().join("\n"))
            .setFooter(`Use "help <command>" for more information.`);
    }
}

class CommandHelp extends ResponseHelp {
    constructor(
        public readonly command_alias: string,
        public readonly meta: CommandMetadata<unknown[]>
    ) {
        super();
    }

    to_embed(): MessageEmbed {
        const title = this.format_title(this.meta, this.command_alias);
        const usage = this.format_usage(this.meta);

        const embed = super
            .to_embed()
            .setTitle(title)
            .setDescription(this.meta.description)
            .addField("Usage", usage);

        if (this.meta.parameters.length > 0) {
            const parameters = this.format_parameters(this.meta.parameters);
            embed.addField("Parameters", parameters);
        }

        if (this.meta.permissions?.length > 0) {
            embed.addField(
                "Permissions required",
                this.format_permissions(this.meta.permissions)
            );
        }

        if (this.meta.aliases) {
            const aliases = this.format_aliases(this.meta.aliases);
            embed.addField("Aliases", aliases);
        }

        if (this.meta.parameters.every((p) => p.examples)) {
            const example = this.format_example(
                this.command_alias,
                this.meta.parameters
            );
            embed.setFooter(example);
        }

        return embed;
    }

    private format_title(
        { name }: CommandMetadata<unknown[]>,
        command_alias: string
    ) {
        return command_alias === name
            ? name
            : `${name}・alias *${command_alias}*`;
    }

    private format_usage({
        name,
        parameters,
    }: CommandMetadata<unknown[]>): string {
        const usage = [name, ...parameters].join(" ");

        return `\`${usage}\``;
    }

    private format_parameters(parameters: Parameters<unknown[]>): string {
        return parameters.map(this.format_parameter).join("\n");
    }

    private format_parameter({
        name,
        parser: { type },
        description,
    }: Parameter<unknown>): string {
        const name_normalized = name.split(" ").join("-");

        return `**${name_normalized}** \u2014 (${type}) ${description}`;
    }

    private format_permissions(permissions: PermissionResolvable[]): string {
        const permission_names = new Map<PermissionResolvable, string>([
            [Permissions.FLAGS.VIEW_CHANNEL, "View Channels"],
            [Permissions.FLAGS.MANAGE_CHANNELS, "Manage Channels"],
            [Permissions.FLAGS.MANAGE_ROLES, "Manage Roles"],
            [Permissions.FLAGS.MANAGE_EMOJIS, "Manage Emojis"],
            [Permissions.FLAGS.VIEW_AUDIT_LOG, "View Audit Log"],
            [Permissions.FLAGS.MANAGE_WEBHOOKS, "Manage Webhooks"],
            [Permissions.FLAGS.MANAGE_GUILD, "Manage Server"],
            [Permissions.FLAGS.CREATE_INSTANT_INVITE, "Create Invite"],
            [Permissions.FLAGS.CHANGE_NICKNAME, "Change Nickname"],
            [Permissions.FLAGS.MANAGE_NICKNAMES, "Manage Nicknames"],
            [Permissions.FLAGS.KICK_MEMBERS, "Kick Members"],
            [Permissions.FLAGS.BAN_MEMBERS, "Ban Members"],
            [Permissions.FLAGS.SEND_MESSAGES, "Send Messages"],
            [Permissions.FLAGS.EMBED_LINKS, "Embed Links"],
            [Permissions.FLAGS.ATTACH_FILES, "Attach Files"],
            [Permissions.FLAGS.ADD_REACTIONS, "Add Reactions"],
            [Permissions.FLAGS.USE_EXTERNAL_EMOJIS, "Use External Emoji"],
            [
                Permissions.FLAGS.MENTION_EVERYONE,
                "Mention @everyone, @here and All Roles",
            ],
            [Permissions.FLAGS.MANAGE_MESSAGES, "Manage Messages"],
            [Permissions.FLAGS.READ_MESSAGE_HISTORY, "Read Message History"],
            [
                Permissions.FLAGS.SEND_TTS_MESSAGES,
                "Send Text-to-Speech Messages",
            ],
            // USE_SLASH_COMMANDS is not defined in the current version of discord.js
            // [Permissions.FLAGS.USE_SLASH_COMMANDS , "Use Slash Commands"],
            [Permissions.FLAGS.CONNECT, "Connect"],
            [Permissions.FLAGS.SPEAK, "Speak"],
            [Permissions.FLAGS.STREAM, "Video"],
            [Permissions.FLAGS.USE_VAD, "Use Voice Activity"],
            [Permissions.FLAGS.PRIORITY_SPEAKER, "Priority Speaker"],
            [Permissions.FLAGS.MUTE_MEMBERS, "Mute Members"],
            [Permissions.FLAGS.DEAFEN_MEMBERS, "Deafen Members"],
            [Permissions.FLAGS.MOVE_MEMBERS, "Move Members"],
            [Permissions.FLAGS.ADMINISTRATOR, "Administrator"],
        ]);

        return permissions
            .map(
                (p) =>
                    permission_names.get(p) ??
                    `<unrecognized permission id: ${p}>`
            )
            .join(", ");
    }

    private format_aliases(aliases: string[]): string {
        return aliases.sort().join(", ");
    }

    private format_example(
        command_alias: string,
        parameters: Parameters<unknown[]>
    ): string {
        const example = [
            command_alias,
            ...parameters.map((p) => sample(p.examples)),
        ].join(" ");

        return config.prefix + example;
    }
}
