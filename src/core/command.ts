import { MessageEmbed } from "discord.js";
import { Response, ResponseError } from "./response";
import { Request, ValidatedRequest } from "./request";
import { Err, Ok, Result } from "ts-results";
import { split_args } from "./split_args";
import { assert } from "console";
import { zip } from "./util";
import { Parameters } from "./parameter";
import { DiscordPermission } from "./permissions";
import config from "../../data/config";

export type CommandMetadata<T extends unknown[]> = {
    name: string;
    description: string;
    aliases?: string[];
    parameters: Parameters<T>;
    permissions: DiscordPermission[];
    accept_remainder_arg?: boolean;
    owner_only?: boolean;
    suppress_typing?: boolean;
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
        if (
            this.meta.owner_only &&
            request.source.author.id !== config.owner_id
        ) {
            return Err("this command is for the bot owner only");
        }

        if (this.meta.permissions.length === 0) {
            // no permissions required
            return Ok.EMPTY;
        }

        const user_has_permission =
            request.source.member?.hasPermission(
                this.meta.permissions.map((p) => p.flag)
            ) ?? false;

        if (!user_has_permission) {
            return Err("you don't have enough permissions to do that");
        }

        const bot_has_permission =
            request.source.guild?.me?.hasPermission(
                this.meta.permissions.map((p) => p.flag)
            ) ?? false;

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
            param.parser.parse(arg).mapErr(
                (error) =>
                    error.actual_value
                        ? `\`${error.actual_value}\` in parameter \`${param}\` is not a \`${error.expected_type}\``
                        : "too few arguments" // TODO: figure out a proper way to generate this error
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
