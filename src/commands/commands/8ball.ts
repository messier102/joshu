import { MessageEmbed } from "discord.js";
import { Command, CommandParameter } from "../command";
import { ValidatedCommandRequest } from "../request";
import { CommandResponseOk } from "../response";
import StringConverter from "../type_converters/StringConverter";

export default new Command(
    {
        parameters: [new CommandParameter("question", StringConverter)],
        permissions: [],

        accept_remainder_arg: true,
    },

    async (_: ValidatedCommandRequest, _question: string) => {
        // we don't actually care about the question lol
        return new EightBallResponse("Ask me later.");
    }
);

class EightBallResponse extends CommandResponseOk {
    constructor(public readonly answer: string) {
        super();
    }

    to_embed(): MessageEmbed {
        return super.to_embed().setDescription(`🎱 ${this.answer}`);
    }
}
