import { MessageEmbed } from "discord.js";
import { sample } from "lodash";
import config from "../../data/config";
import { AnyCommand, Command, CommandMetadata } from "./command";
import { Parameter, Parameters } from "./parameter";
import { optional } from "./parsers/optional";
import { pString } from "./parsers/String";
import { ValidatedRequest } from "./request";
import { CommandNameResolver, CommandResponseNotFound } from "./resolver";
import { ResponseHelp } from "./response";

export function HelpCommand(
    resolver: () => CommandNameResolver
): Command<[command?: string | undefined]> {
    return new Command(
        {
            name: "help",
            description: "Displays command help pages",
            parameters: [
                new Parameter({
                    name: "command",
                    parser: optional(pString),
                    description: "The command to display help for",
                    examples: ["help", "ban", "expire"],
                }),
            ],
            permissions: [],
        },

        async (_: ValidatedRequest, command_name?: string) => {
            if (command_name) {
                const command = resolver().resolve(command_name);

                if (command.ok) {
                    return new CommandHelp(command_name, command.val.meta);
                } else {
                    const suggestion = command.val;
                    return new CommandResponseNotFound(suggestion);
                }
            } else {
                return new CommandResponseCommandList(resolver().commands);
            }
        }
    );
}

class CommandResponseCommandList extends ResponseHelp {
    constructor(public readonly commands: AnyCommand[]) {
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
