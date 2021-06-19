import { AnyCommand } from "./command";
import { find_similar_string, Weights } from "./find_similar_string";
import { Err, Ok, Result } from "ts-results";

export class CommandNameResolver {
    private readonly command_table: Map<string, AnyCommand> = new Map();
    private readonly command_search: WordSearch;

    constructor(commands: AnyCommand[]) {
        for (const command of commands) {
            this.register_command_name(command.meta.name, command);

            command.meta.aliases?.forEach((alias) =>
                this.register_command_name(alias, command)
            );
        }

        this.command_search = new WordSearch([
            ...this.command_table.keys(),
            "help", // help is a built-in, but we still want to provide suggestions for it
        ]);

        console.log("Configured routes:");
        console.log(this.command_table);
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
            const suggestion = this.command_search.find_most_similar(
                command_name
            );

            return Err(suggestion);
        }
    }
}

class WordSearch {
    private readonly weights: Weights;
    private readonly max_distance: number;

    constructor(private readonly words: string[]) {
        this.weights = {
            substitution: 3,
            insertion: 0,
            deletion: 1,
        };
        this.max_distance = 6;
    }

    find_most_similar(word: string): string | undefined {
        return this.find_similar(word)[0];
    }

    private find_similar(word: string): string[] {
        return find_similar_string(
            this.words,
            this.weights,
            this.max_distance,
            word
        );
    }
}
