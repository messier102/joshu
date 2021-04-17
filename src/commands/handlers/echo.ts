import { zip } from "lodash";
import { Command } from "../command";
import { CommandHandler } from "../handler";
import { StringArgument } from "../type_guards/string";

export default class Echo implements CommandHandler {
    private readonly arg_guards = [
        new StringArgument(), // message
    ];

    usage(): string {
        return this.arg_guards.map((guard) => `<${guard.type}>`).join(" ");
    }

    can_handle_command({ args }: Command): boolean {
        const args_are_valid = zip(args, this.arg_guards).every(
            ([arg, arg_guard]) =>
                arg && arg_guard && arg_guard.is_valid_argument(arg)
        );

        return args_are_valid;
    }

    handle_command({ source, args }: Command): void {
        source.channel.send(args.join(" "));
    }
}
