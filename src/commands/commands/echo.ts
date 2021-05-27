import { CommandRequest } from "../request";
import { CommandParameter, Command } from "../command";
import StringConverter from "../type_converters/StringConverter";
import { Ok, Result } from "ts-results";
import { CommandResponse } from "../response";

export default Command({
    parameters: [new CommandParameter("message", StringConverter)],
    permissions: [],

    accept_remainder_arg: true,

    async execute(
        _: CommandRequest,
        message: string
    ): Promise<Result<CommandResponse, string>> {
        return Ok(CommandResponse.Message(message));
    },
});
