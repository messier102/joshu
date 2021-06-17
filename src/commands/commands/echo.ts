import { ValidatedCommandRequest } from "../request";
import { Command } from "../command";
import { pString } from "../parsers/String";
import { CommandResponse } from "../response";
import { Parameter } from "../parameter";

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
