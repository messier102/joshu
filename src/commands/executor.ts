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

    execute(request: CommandRequest): void {
        // TODO: proper logging
        console.log(
            `[${request.source.author.tag}]`,
            request.name,
            request.args
        );

        this.check_permissions(request);

        const parsed_args = this.parse_args(request.args);

        this.check_can_execute(request, parsed_args);

        this.command.execute(request, ...parsed_args);
    }

    private parse_args(input: string): unknown[] {
        const args = this.split_args(input);

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

    private split_args(input: string): string[] {
        const args = [];

        let remaining_input = input.trim();

        if (this.command.accept_remainder) {
            const split_param_count = this.command.parameters.length - 1;

            for (let i = 0; i < split_param_count; i++) {
                const [arg, rest] = this.split_arg(remaining_input);

                args.push(arg);
                remaining_input = rest.trim();
            }

            args.push(remaining_input);
        } else {
            while (remaining_input) {
                const [arg, rest] = this.split_arg(remaining_input);

                args.push(arg);
                remaining_input = rest.trim();
            }
        }

        console.log(args);

        return args;
    }

    private split_arg(input: string): [string, string] {
        const quoted_arg_regex = /^"((?:\\"|[^"])*)"(.*)$/;
        const simple_arg_regex = /^(\S+)(.*)$/;

        if (input.startsWith(`"`)) {
            // quoted argument
            const match = input.match(quoted_arg_regex);

            if (!match) {
                throw new Error("probably missing closing quote");
            }

            const [_, arg, rest] = match;
            if (rest && !rest.startsWith(" ")) {
                throw new Error("quoted arguments must be delimited by space");
            }

            return [arg, rest];
        } else {
            // simple argument
            const match = input.match(simple_arg_regex);

            if (!match) {
                throw new Error("unreachable");
            }

            const [_, arg, rest] = match;
            if (arg.includes(`"`)) {
                throw new Error("unexpected quote mark inside argument");
            }

            return [arg, rest];
        }
    }
}
