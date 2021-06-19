import { AnyCommand } from "./command";
import { find_similar_string, Weights } from "./find_similar_string";
import { Err, Ok, Result } from "ts-results";

export class CommandNameResolver {
    private readonly command_table: Map<string, AnyCommand> = new Map();

    constructor(public readonly commands: AnyCommand[]) {
        for (const command of commands) {
            this.register_command_name(command.meta.name, command);

            command.meta.aliases?.forEach((alias) =>
                this.register_command_name(alias, command)
            );

            console.log("Configured routes:");
            console.log(this.command_table);
        }
    }

    private register_command_name(command_name: string, command: AnyCommand) {
        if (this.command_table.has(command_name)) {
            console.warn(`Name collision: ${command_name} already exists`);
        }

        this.command_table.set(command_name, command);
    }

    resolve(command_name: string): Result<AnyCommand, string | undefined> {
        const command = this.command_table.get(command_name);

        if (command) {
            return Ok(command);
        } else {
            const suggestion = this.find_most_similar_command(command_name);

            return Err(suggestion);
        }
    }

    private find_most_similar_command(
        command_name: string
    ): string | undefined {
        return this.find_similar_commands(command_name)[0];
    }

    private find_similar_commands(command_name: string): string[] {
        const command_names = [...this.command_table.keys(), "help"];
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
