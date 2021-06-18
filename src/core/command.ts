import { MessageEmbed, PermissionResolvable } from "discord.js";
import { Response, ResponseError, ResponseHelp } from "./response";
import { Request, ValidatedRequest } from "./request";
import { Err, Ok, Result } from "ts-results";
import { split_args } from "./split_args";
import { assert } from "node:console";
import { zip } from "./util";
import { sample } from "lodash";
import config from "../../data/config";
import { Parameter, Parameters } from "./parameter";

type CommandMetadata<T extends unknown[]> = {
    name: string;
    description: string;
    aliases?: string[];
    parameters: Parameters<T>;
    permissions: PermissionResolvable[];
    accept_remainder_arg?: boolean;
};

type CommandHandler<T extends unknown[]> = (
    request: ValidatedRequest,
    ...args: T
) => Promise<Response>;

export class Command<T extends unknown[]> {
    constructor(
        public readonly meta: CommandMetadata<T>,
        public readonly handler: CommandHandler<T>
    ) {}

    help(command_alias: string): Response {
        return new CommandHelp(command_alias, this.meta);
    }

    async execute(request: Request): Promise<Response> {
        // TODO: proper logging
        console.log(
            `[${request.source.author.tag}]`,
            request.name,
            request.args
        );

        if (!request.source.guild) {
            return Response.Error("Sorry, I don't accept commands in DMs.");
        }

        const perm_check = this.check_permissions(request);
        if (perm_check.err) {
            return Response.Error(perm_check.val);
        }

        const parsed_args = this.parse_args(request.args);
        if (parsed_args.err) {
            return new ArgumentError(
                parsed_args.val,
                `${request.name} ${this.meta.parameters.join(" ")}`
            );
        }

        const execution_result = await this.handler(
            request as ValidatedRequest,
            ...parsed_args.val
        );
        return execution_result;
    }

    private check_permissions(request: Request): Result<void, string> {
        if (this.meta.permissions.length === 0) {
            // no permissions required
            return Ok.EMPTY;
        }

        const user_has_permission =
            request.source.member?.hasPermission(this.meta.permissions) ??
            false;

        if (!user_has_permission) {
            return Err("you don't have enough permissions to do that");
        }

        const bot_has_permission =
            request.source.guild?.me?.hasPermission(this.meta.permissions) ??
            false;

        if (!bot_has_permission) {
            return Err("I don't have enough permissions to do that");
        }

        return Ok.EMPTY;
    }

    private parse_args(input: string): Result<T, string> {
        return split_args(
            input,
            this.meta.parameters.length,
            this.meta.accept_remainder_arg ?? false
        ).andThen((arg_strings) => this.convert_args(arg_strings));
    }

    private convert_args(args: string[]): Result<T, string> {
        assert(args.length === this.meta.parameters.length);

        const arg_param_pairs = [...zip(args, this.meta.parameters)];

        const maybe_converted_args = arg_param_pairs.map(([arg, param]) =>
            param.parser
                .parse(arg)
                .mapErr(
                    (error) =>
                        `\`${error.actual_value}\` in parameter \`${param}\` is not a \`${error.expected_type}\``
                )
        );

        return Result.all(...maybe_converted_args) as Result<T, string>;
    }
}

export type AnyCommand = Command<unknown[]>;

class ArgumentError extends ResponseError {
    constructor(
        public readonly reason: string,
        public readonly usage_hint: string
    ) {
        super();
    }

    to_embed(): MessageEmbed {
        return super
            .to_embed()
            .addField("Error", this.reason)
            .setFooter(this.usage_hint);
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
