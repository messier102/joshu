import type Discord from "discord.js";

export class Command {
    constructor(
        public name: string,
        public args: string[],
        public source: Discord.Message
    ) {}

    static from_raw_message(message: Discord.Message, prefix: string): Command {
        const args = message.content.slice(prefix.length).split(" ");
        const [command_name, ...command_args] = args;

        return new Command(command_name, command_args, message);
    }
}

type CommandHandler = (command: Command) => void;

type CommandHandlerStore = {
    [command_name: string]: CommandHandler;
};

export const command_handlers: CommandHandlerStore = {
    ping: ({ source }) => {
        source.reply("pong!");
    },

    giverole: async ({ args, source }) => {
        const [target_user_mention, role_name, role_color] = args;

        const target_user_id = user_id_from_mention(target_user_mention);
        if (!target_user_id) return;

        const target_member = source.guild?.members.cache.get(target_user_id);
        if (!target_member) return;

        const role = await source.guild?.roles.create({
            data: {
                name: role_name,
                color: role_color,
                permissions: 0,
                mentionable: true,
            },
        });
        if (!role) {
            return;
        }

        target_member.roles.add(role.id).then(() => {
            source.channel.send(
                `Gave ${target_member} a new role \`${role.name}\``
            );
        });
    },
};

function user_id_from_mention(mention: string): string | null {
    const mention_regex = /<@!(\d+)>/;
    const match = mention.match(mention_regex);

    return match && match[1];
}
