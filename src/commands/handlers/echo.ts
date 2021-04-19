import { zip } from "lodash";
import { Command } from "../command";
import { CommandHandler } from "../handler";
import { Parameter } from "../parameter";
import { StringArgument } from "../type_guards/string";

export default class Echo implements CommandHandler {
    private readonly parameters = [
        new Parameter("message", new StringArgument()),
    ];

    usage(): string {
        return this.parameters.join(" ");
    }

    can_handle_command({ args }: Command): boolean {
        const args_are_valid = zip(args, this.parameters).every(
            ([arg, expected_param]) =>
                arg &&
                expected_param &&
                expected_param.type_guard.is_valid_argument(arg)
        );

        return args_are_valid;
    }

    handle_command({ source, args }: Command): void {
        source.channel.send(args.join(" "));
    }
}
