import { ValidatedCommandRequest } from "../request";
import { Parameter, Command } from "../command";
import StringConverter from "../parsers/StringConverter";
import { CommandResponse } from "../response";

export default new Command(
    {
        name: "echo",
        description: "Prints back the provided message.",

        parameters: [
            new Parameter({
                name: "message",
                type: StringConverter,
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
