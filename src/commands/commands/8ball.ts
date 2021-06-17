import { MessageEmbed } from "discord.js";
import { Command } from "../command";
import { ValidatedCommandRequest } from "../request";
import { CommandResponseOk } from "../response";
import { pString } from "../parsers/String";
import { sample } from "lodash";
import { Parameter } from "../parameter";

export default new Command(
    {
        name: "8ball",
        description: "Gives randomized yes/no answers to users' questions.",

        parameters: [
            new Parameter({
                name: "question",
                parser: pString,
                description: "User's question.",
                examples: [
                    "Is today going to be a good day?",
                    "Should I sleep?",
                    "Is dip into feet?",
                ],
            }),
        ],
        permissions: [],

        accept_remainder_arg: true,
    },

    async ({ source }: ValidatedCommandRequest, question: string) => {
        const random_answer = sample(POSSIBLE_ANSWERS) as string;

        return new EightBallResponse(
            question,
            source.author.username,
            random_answer
        );
    }
);

class EightBallResponse extends CommandResponseOk {
    constructor(
        public readonly question: string,
        public readonly asker: string,
        public readonly answer: string
    ) {
        super();
    }

    to_embed(): MessageEmbed {
        return super
            .to_embed()
            .addField(`❓ ${this.asker} asks`, this.question)
            .addField("🎱 8-ball says", this.answer);
    }
}

const POSSIBLE_ANSWERS = [
    "Yes.",
    "Yes, definitely.",
    "As I see it, yes.",
    "Signs point to yes.",
    "It is certain.",
    "It is decidedly so.",
    "Without a doubt.",
    "You may rely on it.",
    "Most likely.",
    "Outlook good.",
    "Yep cock.",
    "No.",
    "My reply is no.",
    "My sources say no.",
    "Don't count on it.",
    "Outlook not so good.",
    "Very doubtful.",
];
