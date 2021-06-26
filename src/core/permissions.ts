import { PermissionResolvable, Permissions } from "discord.js";

// prettier-ignore
export class DiscordPermission {
    private constructor(
        readonly name: string,
        readonly flag: PermissionResolvable
    ) { }

    static ViewChannels = new DiscordPermission("View Channels", Permissions.FLAGS.VIEW_CHANNEL);
    static ManageChannels = new DiscordPermission("Manage Channels", Permissions.FLAGS.MANAGE_CHANNELS);
    static ManageRoles = new DiscordPermission("Manage Roles", Permissions.FLAGS.MANAGE_ROLES);
    static ManageEmojis = new DiscordPermission("Manage Emojis", Permissions.FLAGS.MANAGE_EMOJIS);
    static ViewAuditLog = new DiscordPermission("View Audit Log", Permissions.FLAGS.VIEW_AUDIT_LOG);
    static ManageWebhooks = new DiscordPermission("Manage Webhooks", Permissions.FLAGS.MANAGE_WEBHOOKS);
    static ManageServer = new DiscordPermission("Manage Server", Permissions.FLAGS.MANAGE_GUILD);
    static CreateInvite = new DiscordPermission("Create Invite", Permissions.FLAGS.CREATE_INSTANT_INVITE);
    static ChangeNickname = new DiscordPermission("Change Nickname", Permissions.FLAGS.CHANGE_NICKNAME);
    static ManageNicknames = new DiscordPermission("Manage Nicknames", Permissions.FLAGS.MANAGE_NICKNAMES);
    static KickMembers = new DiscordPermission("Kick Members", Permissions.FLAGS.KICK_MEMBERS);
    static BanMembers = new DiscordPermission("Ban Members", Permissions.FLAGS.BAN_MEMBERS);
    static SendMessages = new DiscordPermission("Send Messages", Permissions.FLAGS.SEND_MESSAGES);
    static EmbedLinks = new DiscordPermission("Embed Links", Permissions.FLAGS.EMBED_LINKS);
    static AttachFiles = new DiscordPermission("Attach Files", Permissions.FLAGS.ATTACH_FILES);
    static AddReactions = new DiscordPermission("Add Reactions", Permissions.FLAGS.ADD_REACTIONS);
    static UseExternalEmoji = new DiscordPermission("Use External Emoji", Permissions.FLAGS.USE_EXTERNAL_EMOJIS);
    static MentionEveryone = new DiscordPermission("Mention @everyone, @here and All Roles", Permissions.FLAGS.MENTION_EVERYONE);
    static ManageMessages = new DiscordPermission("Manage Messages", Permissions.FLAGS.MANAGE_MESSAGES);
    static ReadMessageHistory = new DiscordPermission("Read Message History", Permissions.FLAGS.READ_MESSAGE_HISTORY);
    static SendTTSMessages = new DiscordPermission("Send Text-to-Speech Messages", Permissions.FLAGS.SEND_TTS_MESSAGES);
    static Connect = new DiscordPermission("Connect", Permissions.FLAGS.CONNECT);
    static Speak = new DiscordPermission("Speak", Permissions.FLAGS.SPEAK);
    static Video = new DiscordPermission("Video", Permissions.FLAGS.STREAM);
    static UseVoiceActivity = new DiscordPermission("Use Voice Activity", Permissions.FLAGS.USE_VAD);
    static PrioritySpeaker = new DiscordPermission("Priority Speaker", Permissions.FLAGS.PRIORITY_SPEAKER);
    static MuteMembers = new DiscordPermission("Mute Members", Permissions.FLAGS.MUTE_MEMBERS);
    static DeafenMembers = new DiscordPermission("Deafen Members", Permissions.FLAGS.DEAFEN_MEMBERS);
    static MoveMembers = new DiscordPermission("Move Members", Permissions.FLAGS.MOVE_MEMBERS);
    static Administrator = new DiscordPermission("Administrator", Permissions.FLAGS.ADMINISTRATOR);
}
