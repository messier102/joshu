import { Command } from "../command";
import { CommandHandler } from "../handler";
import { zip } from "lodash";

export default class Echo implements CommandHandler {
    can_handle_command({ args }: Command): boolean {
        const string_arg = (_arg: string) => true; // all args are initially strings

        const accepted_parameters = [string_arg];

        const arg_types_match_accepted = zip(args, accepted_parameters).every(
            ([arg, is_accepted_arg]) =>
                arg && is_accepted_arg && is_accepted_arg(arg)
        );

        return arg_types_match_accepted;
    }

    handle_command({ source, args }: Command): void {
        source.channel.send(args.join(" "));
    }
}
