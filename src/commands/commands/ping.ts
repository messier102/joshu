import { CommandRequest } from "../request";
import { Command } from "../command";

export default <Command>{
    parameters: [],
    permissions: [],

    execute({ source }: CommandRequest): void {
        source.reply("pong!");
    },
};
