import { PermissionResolvable } from "discord.js";
import { CommandResponse } from "./response";
import { ValidatedCommandRequest } from "./request";
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
        request: ValidatedCommandRequest,
        ...args: unknown[]
    ): Promise<CommandResponse>;
};

// casting arbitrary object to `Command` bypasses some type checks (particularly
// return type of `execute`), so we use this constructor function instead
export function Command(command: Command): Command {
    return command;
}
