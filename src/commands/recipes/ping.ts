import { CommandRequest } from "../request";
import { CommandRecipe } from "../recipe";

export default <CommandRecipe>{
    parameters: [],
    permissions: [],

    execute({ source }: CommandRequest): void {
        source.reply("pong!");
    },
};
