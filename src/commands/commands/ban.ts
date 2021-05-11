import { CommandRequest } from "../request";
import { CommandParameter, Command } from "../command";
import { Client, Permissions, User } from "discord.js";
import dedent from "ts-dedent";
import sample from "lodash/sample";
import MentionConverter from "../type_converters/MentionConverter";
import SnowflakeConverter from "../type_converters/SnowflakeConverter";
import UserTagConverter from "../type_converters/UserTagConverter";
import { any } from "../type_converters/any";

export default <Command>{
    aliases: [
        "axe",
        "expire",
        "terminate",
        "delete",
        "uninvite",
        "321",
        "immolate",
    ],

    parameters: [
        new CommandParameter(
            "target user",
            any(MentionConverter, SnowflakeConverter, UserTagConverter)
        ),
    ],
    permissions: [Permissions.FLAGS.BAN_MEMBERS],

    async execute(
        { name, source }: CommandRequest,
        target_user: string
    ): Promise<void> {
        try {
            const user = await resolve_user(source.client, target_user);

            await source.guild?.members.ban(user);

            const message_template = SPECIAL_BAN_MESSAGES.has(name)
                ? (sample(SPECIAL_BAN_MESSAGES.get(name)) as string)
                : (sample(COMMON_BAN_MESSAGES) as string);

            const message = message_template.replace(
                "%banned_user%",
                `${user}`
            );

            source.channel.send(message);
        } catch (e) {
            source.reply("sorry, I don't know that user.");
        }
    },
};

async function resolve_user(
    client: Client,
    user_id_or_tag: string
): Promise<User> {
    if (user_id_or_tag.includes("#")) {
        const user_tag = user_id_or_tag;
        const user = client.users.cache.find((user) => user.tag === user_tag);
        if (!user) {
            throw new Error("No such user");
        }

        return user;
    } else {
        const user_id = user_id_or_tag;

        return await client.users.fetch(user_id);
    }
}

const COMMON_BAN_MESSAGES = [
    "Banned %banned_user%",
    dedent`
        batta batta batta batta SWING!....POP!!!
        and the crowd goes wild, %banned_user% is outta here!
        GOTCHA!
    `,
];

const SPECIAL_BAN_MESSAGES = new Map([
    [
        "321",
        [
            dedent`
                3 2 1 dead
                sorry then I don't get it
                %banned_user% see you later bye
            `,
        ],
    ],
    [
        "terminate",
        [
            dedent`
                Fellow %banned_user%.
                Contract termination imminent
            `,
        ],
    ],
    [
        "expire",
        [
            dedent`
                %banned_user% has expired
                expired as in deceased
            `,
            "%banned_user%'s presence in this chatroom has expired",
            "%banned_user% status: well and truly expired",
            "%banned_user% fuck off u gallon of expired milk",
            "%banned_user%: nitrous expiration imminent",
            "%banned_user% expired like the twink he is",
            "%banned_user% you're expired",
            "%banned_user% didnt say anything so their contract expired",
            "well whoever was %banned_user% has expired",
            "%banned_user% you bottle of expired soy milk with added vitamin D",
            "%banned_user% ur expiring?!",
            "%banned_user% expired to go on a journey",
            "%banned_user% expired, wouldn’t bother!",
            "i thought %banned_user% expired years ago",
            "i was waiting to see when %banned_user%'d expire",
            "i knew %banned_user% was gonna expire within 3 days",
        ],
    ],
]);
