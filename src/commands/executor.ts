import { CommandRequest } from "./request";
import { Command } from "./command";
import { split_args } from "./split_args";
import { Err, Ok, Result } from "ts-results";
import { assert } from "node:console";
import { zip } from "../util";
import { CommandResponse, CommandResponseError } from "./response";
import { MessageEmbed } from "discord.js";

export class CommandExecutor {
    constructor(private readonly command: Command) {}

    usage(): string {
        return this.command.parameters.join(" ");
    }

    async execute(request: CommandRequest): Promise<CommandResponse> {
        // TODO: proper logging
        console.log(
            `[${request.source.author.tag}]`,
            request.name,
            request.args
        );

        if (this.command.server_only && !request.source.guild) {
            return CommandResponse.Error(
                "This command works only in a server."
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

        const execution_result = await this.command.execute(
            request,
            ...parsed_args.val
        );
        return execution_result;
    }

    private check_permissions(request: CommandRequest): Result<void, string> {
        if (this.command.permissions.length === 0) {
            // no permissions required
            return Ok.EMPTY;
        }

        const user_has_permission =
            request.source.member?.hasPermission(this.command.permissions) ??
            false;

        if (!user_has_permission) {
            return Err("you don't have enough permissions to do that");
        }

        const bot_has_permission =
            request.source.guild?.me?.hasPermission(this.command.permissions) ??
            false;

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
            this.command.parameters.length,
            this.command.accept_remainder_arg ?? false
        ).andThen((arg_strings) => this.convert_args(arg_strings));
    }

    private convert_args(args: string[]): Result<unknown[], string> {
        assert(args.length === this.command.parameters.length);

        const arg_param_pairs = [...zip(args, this.command.parameters)];

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
