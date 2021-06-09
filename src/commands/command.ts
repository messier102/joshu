import { MessageEmbed, PermissionResolvable } from "discord.js";
import { CommandResponse, CommandResponseError } from "./response";
import { CommandRequest, ValidatedCommandRequest } from "./request";
import { TypeConverter } from "./type_converters/TypeConverter";
import { Err, Ok, Result } from "ts-results";
import { split_args } from "./split_args";
import { assert } from "node:console";
import { zip } from "../util";

export class CommandParameter<T> {
    constructor(
        public readonly name: string,
        public readonly type_converter: TypeConverter<T>
    ) {}

    toString(): string {
        return `<${this.name.split(" ").join("_")}>`;
    }
}

type CommandParameters<ParamTypes extends unknown[]> = {
    [Key in keyof ParamTypes]: CommandParameter<ParamTypes[Key]>;
};

type CommandMetadata<T extends unknown[]> = {
    aliases?: string[];
    parameters: CommandParameters<T>;
    permissions: PermissionResolvable[];
    accept_remainder_arg?: boolean;
};

type CommandHandler<T extends unknown[]> = (
    request: ValidatedCommandRequest,
    ...args: T
) => Promise<CommandResponse>;

export class Command<T extends unknown[]> {
    constructor(
        public readonly meta: CommandMetadata<T>,
        public readonly handler: CommandHandler<T>
    ) {}

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
            param.type_converter
                .convert(arg)
                .mapErr(
                    (error) =>
                        `\`${error.actual_value}\` in parameter \`${param}\` is not a \`${error.expected_type}\``
                )
        );

        return Result.all(...maybe_converted_args) as Result<T, string>;
    }
}

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
