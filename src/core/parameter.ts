import { Parser } from "./parsers/parser";

// using a separate object for parameter definition allows us to give more
// clarity and DSL-like appearance to command definitions, providing named
// properties as opposed to plain positional arguments
type ParameterMetadata<T> = {
    readonly name: string;
    readonly parser: Parser<T>;
    readonly description: string;
    readonly examples: string[];
};

export class Parameter<T> {
    readonly name: string;
    readonly parser: Parser<T>;
    readonly description: string;
    readonly examples: string[];

    constructor({ name, parser, description, examples }: ParameterMetadata<T>) {
        this.name = name;
        this.parser = parser;
        this.description = description;
        this.examples = examples;
    }

    toString(): string {
        return `<${this.name.split(" ").join("-")}>`;
    }
}

export type Parameters<ParamTypes extends unknown[]> = {
    [key in keyof ParamTypes]: Parameter<ParamTypes[key]>;
};
