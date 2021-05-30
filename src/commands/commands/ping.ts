import { CommandRequest } from "../request";
import { Command } from "../command";
import { CommandResponse } from "../response";

export default Command({
    parameters: [],
    permissions: [],

    async execute(_: CommandRequest): Promise<CommandResponse> {
        return CommandResponse.Ok("Pong!");
    },
});
