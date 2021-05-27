import { PermissionResolvable } from "discord.js";
import { Result } from "ts-results";
import { CommandRequest } from "./request";
import { TypeConverter } from "./type_converters/TypeConverter";

export class CommandParameter {
    constructor(
        public readonly name: string,
        public readonly type_converter: TypeConverter
    ) {}

    toString(): string {
        return `<${this.name.split(" ").join("_")}>`;
    }
}

export type Command = {
    aliases?: readonly string[];
    parameters: readonly CommandParameter[];
    permissions: readonly PermissionResolvable[];
    accept_remainder_arg?: boolean;

    execute(
        request: CommandRequest,
        ...args: unknown[]
    ): Promise<Result<string, string>>;
};

export function Command(command: Command): Command {
    return command;
}
