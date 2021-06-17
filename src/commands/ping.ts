import { Command } from "../core/command";
import { CommandResponse } from "../core/response";

export default new Command(
    {
        name: "ping",
        description:
            "Replies with 'pong'. Useful to check if the bot is currently up.",

        parameters: [],
        permissions: [],
    },

    async () => CommandResponse.Ok("Pong!")
);
