import { zip } from "lodash";
import { CommandRequest } from "./request";
import { Command, CommandParameter } from "./command";

import {
    ArgumentTypeError,
    BotPermissionsError,
    UserPermissionsError,
    PrecheckError,
} from "./error";
import { split_args } from "./split_args";
import { Err, Ok, Result } from "ts-results";

export class CommandExecutor {
    constructor(private readonly command: Command) {}

    usage(): string {
        return this.command.parameters.join(" ");
    }

    execute(request: CommandRequest): Result<void, ArgumentTypeError> {
        // TODO: proper logging
        console.log(
            `[${request.source.author.tag}]`,
            request.name,
            request.args
        );

        this.check_permissions(request);

        const parsed_args = this.parse_args(request.args);
        if (!parsed_args.ok) {
            return parsed_args;
        }

        this.check_can_execute(request, parsed_args.val);

        this.command.execute(request, ...parsed_args.val);

        return Ok.EMPTY;
    }

    private check_permissions(request: CommandRequest): void {
        if (this.command.permissions.length === 0) {
            return;
        }

        const user_has_permission =
            request.source.member?.hasPermission(this.command.permissions) ??
            false;

        if (!user_has_permission) {
            throw new UserPermissionsError();
        }

        const bot_has_permission =
            request.source.guild?.me?.hasPermission(this.command.permissions) ??
            false;

        if (!bot_has_permission) {
            throw new BotPermissionsError();
        }
    }

    private check_can_execute(
        request: CommandRequest,
        parsed_args: unknown[]
    ): void {
        if (this.command.can_execute) {
            if (!this.command.can_execute(request, ...parsed_args)) {
                throw new PrecheckError();
            }
        }
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
