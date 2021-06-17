import { ValidatedCommandRequest } from "../core/request";
import { Command } from "../core/command";
import { pString } from "../core/parsers/String";
import { CommandResponse } from "../core/response";
import { Parameter } from "../core/parameter";

export default new Command(
    {
        name: "echo",
        description: "Prints back the provided message.",

        parameters: [
            new Parameter({
                name: "message",
                parser: pString,
                description: "The message to print back.",
                examples: ["Hello world", "Ahh what a beautiful day"],
            }),
        ],
        permissions: [],

        accept_remainder_arg: true,
    },

    async (_: ValidatedCommandRequest, message: string) => {
        return CommandResponse.Ok(message);
    }
);
