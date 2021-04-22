import { zip } from "lodash";
import { CommandRequest } from "./request";
import { Command } from "./command";
import { ConversionError } from "./type_converters/TypeConverter";

export class CommandExecutor {
    constructor(private readonly recipe: Command) {}

    usage(): string {
        return this.recipe.parameters.join(" ");
    }

    execute(request: CommandRequest, args: string[]): void {
        // TODO: proper logging
        console.log(request.name, args, request.source.author.tag);

        if (args.length !== this.recipe.parameters.length) {
            throw new Error("wrong number of arguments");
        }

        if (this.recipe.permissions.length > 0) {
            const user_has_permission =
                request.source.member?.hasPermission(this.recipe.permissions) ??
                false;

            if (!user_has_permission) {
                throw new Error("insufficient user permissions");
            }

            const bot_has_permission =
                request.source.guild?.me?.hasPermission(
                    this.recipe.permissions
                ) ?? false;

            if (!bot_has_permission) {
                throw new Error("insufficient bot permissions");
            }
        }

        const parsed_args = zip(request.args, this.recipe.parameters).map(
            ([arg, param]) => {
                try {
                    return param?.type_converter.convert(arg!);
                } catch (e: unknown) {
                    if (e instanceof ConversionError) {
                        request.source.reply(
                            `expected a \`${e.expected_type}\`, got \`${e.actual_value}\` instead.`
                        );
                        return;
                    }
                }
            }
        );

        if (this.recipe.can_execute) {
            if (!this.recipe.can_execute(request, ...parsed_args)) {
                throw new Error(
                    "failed precheck (make sure the arguments are valid)"
                );
            }
        }

        this.recipe.execute(request, ...parsed_args);
    }
}
