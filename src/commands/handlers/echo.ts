import { Command } from "../command";
import { CommandHandler } from "../handler";
import { zip } from "lodash";

export default class Echo implements CommandHandler {
    can_handle_command({ args }: Command): boolean {
        const arg_guards: ArgumentTypeGuard[] = [new StringArgument()];

        const arg_types_match_accepted = zip(args, arg_guards).every(
            ([arg, arg_guard]) =>
                arg && arg_guard && arg_guard.is_valid_argument(arg)
        );

        return arg_types_match_accepted;
    }

    handle_command({ source, args }: Command): void {
        source.channel.send(args.join(" "));
    }
}

interface ArgumentTypeGuard {
    is_valid_argument(arg: string): boolean;
}

class StringArgument implements ArgumentTypeGuard {
    is_valid_argument(_arg: string): boolean {
        // all command args are valid strings
        return true;
    }
}
