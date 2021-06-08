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

export type Command<T extends unknown[]> = {
    meta: CommandMetadata<T>;
    handler: CommandHandler<T>;
};

export function Command<T extends unknown[]>(
    meta: CommandMetadata<T>,
    handler: CommandHandler<T>
): Command<T> {
    return { meta, handler };
}
