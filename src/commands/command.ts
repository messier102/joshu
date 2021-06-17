import { MessageEmbed, PermissionResolvable } from "discord.js";
import {
    CommandResponse,
    CommandResponseError,
    CommandResponseHelp,
} from "./response";
import { CommandRequest, ValidatedCommandRequest } from "./request";
import { Parser } from "./parsers/parser";
import { Err, Ok, Result } from "ts-results";
import { split_args } from "./split_args";
import { assert } from "node:console";
import { zip } from "../util";
import { sample } from "lodash";
import config from "../../data/config";

type ParameterMetadata<T> = {
    readonly name: string;
    readonly parser: Parser<T>;
    readonly description: string;
    readonly examples: string[];
};

export class Parameter<T> {
    readonly name: string;
    readonly parser: Parser<T>;
    readonly description: string;
    readonly examples: string[];

    constructor({ name, parser, description, examples }: ParameterMetadata<T>) {
        this.name = name;
        this.parser = parser;
        this.description = description;
        this.examples = examples;
    }

    toString(): string {
        return `<${this.name.split(" ").join("-")}>`;
    }
}

type Parameters<ParamTypes extends unknown[]> = {
    [key in keyof ParamTypes]: Parameter<ParamTypes[key]>;
};

type CommandMetadata<T extends unknown[]> = {
    name: string;
    description: string;
    aliases?: string[];
    parameters: Parameters<T>;
    permissions: PermissionResolvable[];
    accept_remainder_arg?: boolean;
};

type CommandHandler<T extends unknown[]> = (
    request: ValidatedCommandRequest,
    ...args: T
) => Promise<CommandResponse>;

class CommandResponseCommandHelp extends CommandResponseHelp {
    constructor(
        public readonly command_alias: string,
        public readonly meta: CommandMetadata<unknown[]>
    ) {
        super();
    }

    to_embed(): MessageEmbed {
        const command_usage = [
            this.meta.name,
            ...this.meta.parameters.map((p) => p.toString()),
        ].join(" ");

        const embed = super
            .to_embed()
            .setTitle(
                this.meta.name +
                    (this.command_alias !== this.meta.name
                        ? `・alias *${this.command_alias}*`
                        : "")
            )
            .setDescription(this.meta.description)
            .addField("Usage", `\`${command_usage}\``);

        if (this.meta.parameters.length > 0) {
            const format_param = (param: Parameter<unknown>) =>
                `**${param.name.split(" ").join("-")}** \u2014 (${
                    param.parser.type
                }) ${param.description}`;

            const formatted_params = this.meta.parameters
                .map(format_param)
                .join("\n");

            embed.addField("Parameters", formatted_params);
        }

        if (this.meta.aliases) {
            embed.addField("Aliases", this.meta.aliases.sort().join(", "));
        }

        if (this.meta.parameters.every((p) => p.examples)) {
            const example_usage = [
                this.command_alias,
                ...this.meta.parameters.map((p) => sample(p.examples)),
            ].join(" ");

            embed.setFooter(config.prefix + example_usage);
        }

        return embed;
    }
}

export class Command<T extends unknown[]> {
    constructor(
        public readonly meta: CommandMetadata<T>,
        public readonly handler: CommandHandler<T>
    ) {}

    help(command_alias: string): CommandResponse {
        return new CommandResponseCommandHelp(command_alias, this.meta);
    }

    async execute(request: CommandRequest): Promise<CommandResponse> {
        // TODO: proper logging
        console.log(
            `[${request.source.author.tag}]`,
            request.name,
            request.args
        );

        if (!request.source.guild) {
            return CommandResponse.Error(
                "Sorry, I don't accept commands in DMs."
            );
        }

        const perm_check = this.check_permissions(request);
        if (perm_check.err) {
            return CommandResponse.Error(perm_check.val);
        }

        const parsed_args = this.parse_args(request.args);
        if (parsed_args.err) {
            return new ArgumentError(
                parsed_args.val,
                `${request.name} ${this.meta.parameters.join(" ")}`
            );
        }

        const execution_result = await this.handler(
            request as ValidatedCommandRequest,
            ...parsed_args.val
        );
        return execution_result;
    }

    private check_permissions(request: CommandRequest): Result<void, string> {
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

class ArgumentError extends CommandResponseError {
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
