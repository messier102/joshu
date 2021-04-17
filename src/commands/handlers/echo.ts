import { zip } from "lodash";
import { Command } from "../command";
import { CommandHandler } from "../handler";
import { StringArgument } from "../type_guards/string";

export default class Echo implements CommandHandler {
    can_handle_command({ args }: Command): boolean {
        const arg_guards = [new StringArgument()];

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
