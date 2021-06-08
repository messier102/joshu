import { Command_v2 } from "../command";
import { CommandResponse } from "../response";

export default Command_v2(
    {
        parameters: [],
        permissions: [],
    },

    async () => CommandResponse.Ok("Pong!")
);
