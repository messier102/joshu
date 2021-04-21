import { PermissionResolvable } from "discord.js";
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

export type CommandRecipe = {
    parameters: readonly CommandParameter[];
    permissions: readonly PermissionResolvable[];

    can_execute?(request: CommandRequest, ...args: unknown[]): boolean;
    execute(request: CommandRequest, ...args: unknown[]): void;
};
