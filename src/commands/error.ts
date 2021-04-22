export interface DiscordReportable {
    to_discord_error(): string;
}

export function is_discord_reportable(obj: unknown): obj is DiscordReportable {
    return (obj as DiscordReportable).to_discord_error !== undefined;
}

export class NumberOfArgumentsError implements DiscordReportable {
    constructor(
        public readonly num_expected: number,
        public readonly num_actual: number
    ) {}

    to_discord_error(): string {
        const few_or_many =
            this.num_actual > this.num_expected ? "many" : "few";

        return `too ${few_or_many} arguments`;
    }
}

export class ArgumentTypeError implements DiscordReportable {
    constructor(
        public readonly parameter_name: string,
        public readonly parameter_type: string,
        public readonly actual_value: string
    ) {}

    to_discord_error(): string {
        return `\`${this.actual_value}\` in parameter \`${this.parameter_name}\` is not a \`${this.parameter_type}\``;
    }
}

// TODO: specify which permissions are missing
export class UserPermissionsError implements DiscordReportable {
    to_discord_error(): string {
        return "you don't have enough permissions to do that";
    }
}

export class BotPermissionsError implements DiscordReportable {
    to_discord_error(): string {
        return "I don't have enough permissions to do that";
    }
}

export class PrecheckError implements DiscordReportable {
    to_discord_error(): string {
        return "precheck failed - make sure the arguments are valid";
    }
}
