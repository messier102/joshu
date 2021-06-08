import { ValidatedCommandRequest } from "../request";
import { CommandParameter, Command } from "../command";
import StringConverter from "../type_converters/StringConverter";
import { CommandResponse } from "../response";

export default Command({
    parameters: [new CommandParameter("message", StringConverter)],
    permissions: [],

    accept_remainder_arg: true,

    async execute(
        _: ValidatedCommandRequest,
        message: string
    ): Promise<CommandResponse> {
        return CommandResponse.Ok(message);
    },
});
