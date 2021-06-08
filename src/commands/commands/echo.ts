import { ValidatedCommandRequest } from "../request";
import { CommandParameter, Command } from "../command";
import StringConverter from "../type_converters/StringConverter";
import { CommandResponse } from "../response";

export default Command(
    {
        parameters: [new CommandParameter("message", StringConverter)],
        permissions: [],

        accept_remainder_arg: true,
    },

    async (_: ValidatedCommandRequest, message: string) => {
        return CommandResponse.Ok(message);
    }
);
