import { CommandRequest } from "../request";
import { Command } from "../command";
import { Ok, Result } from "ts-results";

export default Command({
    parameters: [],
    permissions: [],

    async execute(_: CommandRequest): Promise<Result<string, string>> {
        return Ok("Pong!");
    },
});
