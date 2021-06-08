import { ValidatedCommandRequest } from "../request";
import { CommandParameter, Command } from "../command";
import {
    Client,
    GuildMember,
    MessageEmbed,
    Permissions,
    User,
} from "discord.js";
import dedent from "ts-dedent";
import sample from "lodash/sample";
import MentionConverter from "../type_converters/MentionConverter";
import SnowflakeConverter from "../type_converters/SnowflakeConverter";
import UserTagConverter from "../type_converters/UserTagConverter";
import { any } from "../type_converters/any";
import { None, Option, Some } from "ts-results";
import { CommandResponse, CommandResponseOk } from "../response";

export default Command({
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
        { name, source }: ValidatedCommandRequest,
        target_user_id_or_tag: string
    ): Promise<CommandResponse> {
        const maybe_target_user = await resolve_user(
            source.client,
            target_user_id_or_tag
        );

        if (!maybe_target_user.some) {
            return CommandResponse.Error("sorry, I don't know that user.");
        }

        const target_user = maybe_target_user.val;

        if (source.author === target_user) {
            return CommandResponse.Error("you can't ban yourself, dummy.");
        }

        const source_member = source.member;
        const target_member = source.guild.member(target_user);
        if (
            source_member &&
            target_member &&
            !source_can_ban_target(source_member, target_member)
        ) {
            return CommandResponse.Error(
                "sorry, you can't ban that user.\n" +
                    "(They have a role higher than or equal to yours.)"
            );
        }

        try {
            await source.guild.members.ban(target_user);
        } catch (e) {
            return CommandResponse.Error(
                "sorry, I can't ban that user.\n" +
                    "(This usually means that they have a role higher than mine.)"
            );
        }

        const message_template = SPECIAL_BAN_MESSAGES.has(name)
            ? (sample(SPECIAL_BAN_MESSAGES.get(name)) as string)
            : (sample(COMMON_BAN_MESSAGES) as string);

        return new BanOk(target_user, message_template);
    },
});

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

class BanOk extends CommandResponseOk {
    constructor(
        public readonly user: User,
        public readonly ban_message_template: string
    ) {
        super();
    }

    to_embed(): MessageEmbed {
        const ban_message_rendered = this.ban_message_template.replace(
            "%banned_user%",
            `**${this.user.username}**`
        );

        return super
            .to_embed()
            .setDescription(ban_message_rendered)
            .setFooter(`Banned ${this.user.tag}`);
    }
}

const current_year = new Date().getFullYear();

const COMMON_BAN_MESSAGES = [
    "%banned_user%, get well soon!",
    `"Mr Julian I don't feel so good," said %banned_user%. Then died.`,
    dedent`
        RIP %banned_user% ${current_year}\u2014${current_year}, we hardly knew ye
        Momo: ?!
    `,
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
