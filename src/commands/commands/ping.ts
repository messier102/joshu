import { ValidatedCommandRequest } from "../request";
import { Command } from "../command";
import { CommandResponse } from "../response";

export default Command({
    parameters: [],
    permissions: [],

    async execute(_: ValidatedCommandRequest): Promise<CommandResponse> {
        return CommandResponse.Ok("Pong!");
    },
});
