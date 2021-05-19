import { CommandRequest } from "../request";
import { CommandParameter, Command } from "../command";
import { Client, GuildMember, Permissions, User } from "discord.js";
import dedent from "ts-dedent";
import sample from "lodash/sample";
import MentionConverter from "../type_converters/MentionConverter";
import SnowflakeConverter from "../type_converters/SnowflakeConverter";
import UserTagConverter from "../type_converters/UserTagConverter";
import { any } from "../type_converters/any";
import { None, Option, Some } from "ts-results";

export default <Command>{
    aliases: [
        "axe",
        "expire",
        "terminate",
        "delete",
        "uninvite",
        "321",
        "immolate",
        "shadowbolt",
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
        target_user_id_or_tag: string
    ): Promise<void> {
        const maybe_target_user = await resolve_user(
            source.client,
            target_user_id_or_tag
        );

        if (!maybe_target_user.some) {
            source.reply("sorry, I don't know that user.");
            return;
        }

        const target_user = maybe_target_user.val;

        if (source.author === target_user) {
            source.reply("you can't ban yourself, dummy.");
            return;
        }

        const source_member = source.member;
        const target_member = source.guild?.member(target_user);
        if (
            source_member &&
            target_member &&
            !source_can_ban_target(source_member, target_member)
        ) {
            source.reply(
                "sorry, you can't ban that user.\n" +
                    "(They have a role higher than or equal to yours.)"
            );
            return;
        }

        try {
            await source.guild?.members.ban(target_user);
        } catch (e) {
            source.reply(
                "sorry, I can't ban that user.\n" +
                    "(This usually means that they have a role higher than mine.)"
            );
            return;
        }

        const message_template = SPECIAL_BAN_MESSAGES.has(name)
            ? (sample(SPECIAL_BAN_MESSAGES.get(name)) as string)
            : (sample(COMMON_BAN_MESSAGES) as string);

        const message = message_template.replace(
            "%banned_user%",
            `**${target_user.tag}**`
        );

        source.channel.send(message);
    },
};

async function resolve_user(
    client: Client,
    user_id_or_tag: string
): Promise<Option<User>> {
    return user_id_or_tag.includes("#")
        ? resolve_user_by_tag(client, user_id_or_tag)
        : resolve_user_by_id(client, user_id_or_tag);
}

async function resolve_user_by_tag(
    client: Client,
    user_tag: string
): Promise<Option<User>> {
    const user = client.users.cache.find((user) => user.tag === user_tag);

    return user ? Some(user) : None;
}

async function resolve_user_by_id(
    client: Client,
    user_id: string
): Promise<Option<User>> {
    try {
        const user = await client.users.fetch(user_id);
        return Some(user);
    } catch (e) {
        return None;
    }
}

function source_can_ban_target(
    source_member: GuildMember,
    target_member: GuildMember
): boolean {
    return (
        source_member.roles.highest.comparePositionTo(
            target_member.roles.highest
        ) > 0
    );
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
        "shadowbolt",
        [
            `"May darkness take you, %banned_user%, for when I'm done, the Light will not recognize you."` +
                ` \u2014 <@!242743883413323786>, presumably`,
        ],
    ],
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
