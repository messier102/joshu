import { zip } from "lodash";
import { CommandRequest } from "./request";
import { Command, CommandParameter } from "./command";
import { ConversionError } from "./type_converters/TypeConverter";
import {
    ArgumentTypeError,
    BotPermissionsError,
    UserPermissionsError,
    NumberOfArgumentsError,
    PrecheckError,
} from "./error";

export class CommandExecutor {
    constructor(private readonly command: Command) {}

    usage(): string {
        return this.command.parameters.join(" ");
    }

    execute(request: CommandRequest, args: string[]): void {
        // TODO: proper logging
        console.log(request.name, args, request.source.author.tag);

        this.check_permissions(request);

        const parsed_args = this.parse_args(args);

        this.check_can_execute(request, parsed_args);

        this.command.execute(request, ...parsed_args);
    }

    private parse_args(args: string[]): unknown[] {
        if (args.length !== this.command.parameters.length) {
            throw new NumberOfArgumentsError(
                this.command.parameters.length,
                args.length
            );
        }

        const parsed_args = (<[string, CommandParameter][]>(
            zip(args, this.command.parameters)
        )).map(([arg, param]) => {
            try {
                return param.type_converter.convert(arg);
            } catch (e: unknown) {
                if (e instanceof ConversionError) {
                    throw new ArgumentTypeError(
                        param.name,
                        e.expected_type,
                        e.actual_value
                    );
                }
            }
        });

        return parsed_args;
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
}
