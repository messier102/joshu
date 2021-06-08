import { Command } from "../command";
import { CommandResponse } from "../response";

export default Command(
    {
        parameters: [],
        permissions: [],
    },

    async () => CommandResponse.Ok("Pong!")
);
