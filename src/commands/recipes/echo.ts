import { CommandRequest } from "../request";
import { CommandParameter, CommandRecipe } from "../recipe";
import StringConverter from "../type_converters/StringConverter";

export default <CommandRecipe>{
    parameters: [new CommandParameter("message", StringConverter)],
    permissions: [],

    execute({ source }: CommandRequest, message: string): void {
        source.channel.send(message);
    },
};
