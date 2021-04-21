import { zip } from "lodash";
import { CommandRequest } from "./request";
import { CommandRecipe } from "./recipe";

export class Command {
    constructor(private recipe: CommandRecipe) {}

    usage(): string {
        return this.recipe.parameters.join(" ");
    }

    execute(command: CommandRequest, args: string[]): void {
        console.log(command.name, args);

        if (args.length !== this.recipe.parameters.length) {
            throw new Error("wrong number of arguments");
        }

        const args_are_valid = zip(
            command.args,
            this.recipe.parameters
        ).every(([arg, param]) => param?.type_converter.is_valid_type(arg!));

        if (!args_are_valid) {
            throw new Error("invalid argument types");
        }

        const has_permission =
            command.source.member?.hasPermission(this.recipe.permissions) ??
            false;

        if (!has_permission) {
            throw new Error("insufficient permissions");
        }

        const parsed_args = zip(
            command.args,
            this.recipe.parameters
        ).map(([arg, param]) => param?.type_converter.convert(arg!));

        if (this.recipe.can_execute) {
            if (!this.recipe.can_execute(command, parsed_args)) {
                throw new Error(
                    "failed precheck (make sure the arguments are valid)"
                );
            }
        }

        this.recipe.execute(command, ...parsed_args);
    }
}
