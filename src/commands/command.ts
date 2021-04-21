import { zip } from "lodash";
import { CommandRequest } from "./request";
import { CommandRecipe } from "./recipe";

export class Command {
    constructor(private recipe: CommandRecipe) {}

    execute(command: CommandRequest, args: string[]): void {
        console.log(command.name, args);

        if (args.length !== this.recipe.parameters.length) {
            console.log("args length");
            return;
        }

        const args_are_valid = zip(
            command.args,
            this.recipe.parameters
        ).every(([arg, param]) => param?.type_converter.is_valid_type(arg!));

        if (!args_are_valid) {
            console.log("args invalid");
            return;
        }

        const has_permission =
            command.source.member?.hasPermission(this.recipe.permissions) ??
            false;

        if (!has_permission) {
            console.log("no perms");
            return;
        }

        const parsed_args = zip(
            command.args,
            this.recipe.parameters
        ).map(([arg, param]) => param?.type_converter.convert(arg!));

        if (this.recipe.can_execute) {
            if (!this.recipe.can_execute(command, parsed_args)) {
                console.log("can't execute");
                return;
            }
        }

        this.recipe.execute(command, ...parsed_args);
    }
}
