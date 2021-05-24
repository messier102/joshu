import { CommandRequest } from "../request";
import { Command } from "../command";
import { Ok, Result } from "ts-results";
import { CommandResponse, Reply } from "../response";

export default Command({
    parameters: [],
    permissions: [],

    async execute(_: CommandRequest): Promise<Result<CommandResponse, string>> {
        return Ok(Reply("pong!"));
    },
});
