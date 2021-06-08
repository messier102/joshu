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

type CommandParameters<ParamTypes extends unknown[]> = {
    [Key in keyof ParamTypes]: CommandParameter<ParamTypes[Key]>;
};

type CommandMetadata<T extends unknown[]> = {
    aliases?: string[];
    parameters: CommandParameters<T>;
    permissions: PermissionResolvable[];
    accept_remainder_arg?: boolean;
};

type CommandHandler<T extends unknown[]> = (
    request: ValidatedCommandRequest,
    ...args: T
) => Promise<CommandResponse>;

export class Command<T extends unknown[]> {
    constructor(
        public readonly meta: CommandMetadata<T>,
        public readonly handler: CommandHandler<T>
    ) {}
}
