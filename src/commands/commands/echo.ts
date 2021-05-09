import { CommandRequest } from "../request";
import { CommandParameter, Command } from "../command";
import StringConverter from "../type_converters/StringConverter";

export default <Command>{
    parameters: [new CommandParameter("message", StringConverter)],
    permissions: [],

    accept_remainder_arg: true,

    execute({ source }: CommandRequest, message: string): void {
        source.channel.send(message);
    },
};
