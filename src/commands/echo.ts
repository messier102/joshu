import { ValidatedRequest } from "../core/request";
import { Command } from "../core/command";
import { pString } from "../core/parsers/String";
import { Response } from "../core/response";
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

    async (_: ValidatedRequest, message: string) => {
        return Response.Ok(message);
    }
);
