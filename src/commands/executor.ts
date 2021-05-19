import { zip } from "lodash";
import { CommandRequest } from "./request";
import { Command, CommandParameter } from "./command";

import {
    ArgumentTypeError,
    BotPermissionsError,
    UserPermissionsError,
    PrecheckError,
    DiscordReportable,
} from "./error";
import { split_args } from "./split_args";
import { Err, Ok, Result } from "ts-results";

export class CommandExecutor {
    constructor(private readonly command: Command) {}

    usage(): string {
        return this.command.parameters.join(" ");
    }

    execute(request: CommandRequest): Result<void, DiscordReportable> {
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

        const can_execute_result = this.check_can_execute(
            request,
            parsed_args.val
        );
        if (!can_execute_result.ok) {
            return can_execute_result;
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

    private check_can_execute(
        request: CommandRequest,
        parsed_args: unknown[]
    ): Result<void, PrecheckError> {
        if (this.command.can_execute) {
            if (!this.command.can_execute(request, ...parsed_args)) {
                return Err(new PrecheckError());
            }
        }

        return Ok.EMPTY;
    }

    // unknown[] is required as we're dynamically converting stringly typed arguments
    private parse_args(input: string): Result<unknown[], ArgumentTypeError> {
        const args = split_args(
            input,
            this.command.parameters.length,
            this.command.accept_remainder_arg ?? false
        );

        const parsed_args = [];

        // cast to get rid of nullable types
        // (args.length === parameters.length) is checked in earlier code
        const args_zipped = <[string, CommandParameter][]>(
            zip(args, this.command.parameters)
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
