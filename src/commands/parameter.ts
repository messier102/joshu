import { ArgumentTypeGuard } from "./type_guards/type_guard";

export class Parameter {
    constructor(public name: string, public type_guard: ArgumentTypeGuard) {}

    toString(): string {
        return `<${this.name.replace(" ", "_")}: ${this.type_guard.type}>`;
    }
}
