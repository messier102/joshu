import { CommandRequest, ValidatedCommandRequest } from "./request";
import { Command } from "./command";
import { split_args } from "./split_args";
import { Err, Ok, Result } from "ts-results";
import { assert } from "node:console";
import { zip } from "../util";
import { CommandResponse, CommandResponseError } from "./response";
import { MessageEmbed } from "discord.js";

export class CommandExecutor {
    constructor(private readonly command: Command<unknown[]>) {}

    usage(): string {
        return this.command.meta.parameters.join(" ");
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
                `${request.name} ${this.usage()}`
            );
        }

        const execution_result = await this.command.handler(
            request as ValidatedCommandRequest,
            ...parsed_args.val
        );
        return execution_result;
    }

    private check_permissions(request: CommandRequest): Result<void, string> {
        if (this.command.meta.permissions.length === 0) {
            // no permissions required
            return Ok.EMPTY;
        }

        const user_has_permission =
            request.source.member?.hasPermission(
                this.command.meta.permissions
            ) ?? false;

        if (!user_has_permission) {
            return Err("you don't have enough permissions to do that");
        }

        const bot_has_permission =
            request.source.guild?.me?.hasPermission(
                this.command.meta.permissions
            ) ?? false;

        if (!bot_has_permission) {
            return Err("I don't have enough permissions to do that");
        }

        return Ok.EMPTY;
    }

    // unknown[] is required as we're dynamically converting stringly typed
    // arguments
    private parse_args(input: string): Result<unknown[], string> {
        return split_args(
            input,
            this.command.meta.parameters.length,
            this.command.meta.accept_remainder_arg ?? false
        ).andThen((arg_strings) => this.convert_args(arg_strings));
    }

    private convert_args(args: string[]): Result<unknown[], string> {
        assert(args.length === this.command.meta.parameters.length);

        const arg_param_pairs = [...zip(args, this.command.meta.parameters)];

        const maybe_converted_args = arg_param_pairs.map(([arg, param]) =>
            param.type_converter
                .convert(arg)
                .mapErr(
                    (error) =>
                        `\`${error.actual_value}\` in parameter \`${param}\` is not a \`${error.expected_type}\``
                )
        );

        return Result.all(...maybe_converted_args);
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
