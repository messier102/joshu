import { zip } from "lodash";
import { CommandRequest } from "./request";
import { Command, CommandParameter } from "./command";

import {
    ArgumentTypeError,
    BotPermissionsError,
    UserPermissionsError,
    DiscordReportable,
} from "./error";
import { split_args } from "./split_args";
import { Err, Ok, Result } from "ts-results";

export class CommandExecutor {
    constructor(private readonly command: Command) {}

    usage(): string {
        return this.command.parameters.join(" ");
    }

    execute(request: CommandRequest): Result<void, DiscordReportable | Error> {
        // TODO: proper logging
        console.log(
            `[${request.source.author.tag}]`,
            request.name,
            request.args
        );

        const permissions_check_result = this.check_permissions(request);
        if (!permissions_check_result.ok) {
            return permissions_check_result;
        }

        const parsed_args = this.parse_args(request.args);
        if (!parsed_args.ok) {
            return parsed_args;
        }

        this.command.execute(request, ...parsed_args.val);

        return Ok.EMPTY;
    }

    private check_permissions(
        request: CommandRequest
    ): Result<void, UserPermissionsError | BotPermissionsError> {
        if (this.command.permissions.length === 0) {
            return Ok.EMPTY;
        }

        const user_has_permission =
            request.source.member?.hasPermission(this.command.permissions) ??
            false;

        if (!user_has_permission) {
            return Err(new UserPermissionsError());
        }

        const bot_has_permission =
            request.source.guild?.me?.hasPermission(this.command.permissions) ??
            false;

        if (!bot_has_permission) {
            return Err(new BotPermissionsError());
        }

        return Ok.EMPTY;
    }

    // unknown[] is required as we're dynamically converting stringly typed arguments
    private parse_args(
        input: string
    ): Result<unknown[], ArgumentTypeError | Error> {
        const args_split_result = split_args(
            input,
            this.command.parameters.length,
            this.command.accept_remainder_arg ?? false
        );
        if (args_split_result.err) {
            return args_split_result;
        }

        const parsed_args = [];

        // cast to get rid of nullable types
        // (args.length === parameters.length) is checked in earlier code
        const args_zipped = <[string, CommandParameter][]>(
            zip(args_split_result.val, this.command.parameters)
        );

        for (const [arg, param] of args_zipped) {
            const conversion_result = param.type_converter.convert(arg);

            if (conversion_result.ok) {
                parsed_args.push(conversion_result.val);
            } else {
                const conversion_error = conversion_result.val;

                return Err(
                    new ArgumentTypeError(
                        param.name,
                        conversion_error.expected_type,
                        conversion_error.actual_value
                    )
                );
            }
        }

        return Ok(parsed_args);
    }
}
