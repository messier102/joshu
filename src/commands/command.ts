import { PermissionResolvable } from "discord.js";
import { CommandResponse } from "./response";
import { ValidatedCommandRequest } from "./request";
import { TypeConverter } from "./type_converters/TypeConverter";

export class CommandParameter<T> {
    constructor(
        public readonly name: string,
        public readonly type_converter: TypeConverter<T>
    ) {}

    toString(): string {
        return `<${this.name.split(" ").join("_")}>`;
    }
}

type CommandMetadata<T extends unknown[]> = {
    aliases?: readonly string[];
    parameters: { [P in keyof T]: CommandParameter<T[P]> };
    permissions: readonly PermissionResolvable[];
    accept_remainder_arg?: boolean;
};

type CommandHandler<T extends unknown[]> = (
    request: ValidatedCommandRequest,
    ...args: T
) => Promise<CommandResponse>;

export type Command_v2<T extends unknown[]> = {
    meta: CommandMetadata<T>;
    handler: CommandHandler<T>;
};

export function Command_v2<T extends unknown[]>(
    meta: CommandMetadata<T>,
    handler: CommandHandler<T>
): Command_v2<T> {
    return { meta, handler };
}

// export type Command = {
//     aliases?: readonly string[];
//     parameters: readonly CommandParameter[];
//     permissions: readonly PermissionResolvable[];
//     accept_remainder_arg?: boolean;

//     execute(
//         request: ValidatedCommandRequest,
//         ...args: unknown[]
//     ): Promise<CommandResponse>;
// };

// // casting arbitrary object to `Command` bypasses some type checks (particularly
// // return type of `execute`), so we use this constructor function instead
// export function Command(command: Command): Command {
//     return command;
// }
