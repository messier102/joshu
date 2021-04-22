import { CommandRequest } from "../request";
import { CommandParameter, Command } from "../command";
import StringConverter from "../type_converters/StringConverter";

export default <Command>{
    parameters: [new CommandParameter("message", StringConverter)],
    permissions: [],

    execute({ source }: CommandRequest, message: string): void {
        source.channel.send(message);
    },
};
