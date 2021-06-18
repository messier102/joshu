import { AnyCommand } from "./command";
import { find_similar_string, Weights } from "./find_similar_string";
import { Err, Ok, Result } from "ts-results";

export class RouteResolver {
    private readonly routes: Map<string, AnyCommand> = new Map();

    constructor(public readonly commands: AnyCommand[]) {
        for (const command of commands) {
            this.routes.set(command.meta.name, command);

            if (command.meta.aliases) {
                for (const alias of command.meta.aliases) {
                    if (this.routes.has(alias)) {
                        console.log(`Alias collision: ${alias} already exists`);
                    }

                    this.routes.set(alias, command);
                }
            }

            console.log("Configured routes:");
            console.log(this.routes);
        }
    }

    resolve(command_name: string): Result<AnyCommand, string | undefined> {
        const maybe_command = this.routes.get(command_name);

        if (maybe_command) {
            return Ok(maybe_command);
        } else {
            const similar_commands = this.find_similar_commands(command_name);

            return Err(similar_commands[0]);
        }
    }

    private find_similar_commands(command_name: string): string[] {
        const command_names = [...this.routes.keys(), "help"];
        const weights: Weights = {
            substitution: 3,
            insertion: 0,
            deletion: 1,
        };
        const max_distance = 6;

        return find_similar_string(
            command_names,
            weights,
            max_distance,
            command_name
        );
    }
}
