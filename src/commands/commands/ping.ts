import { Command } from "../command";
import { CommandResponse } from "../response";

export default new Command(
    {
        parameters: [],
        permissions: [],
    },

    async () => CommandResponse.Ok("Pong!")
);
