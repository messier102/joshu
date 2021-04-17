import { ArgumentTypeGuard } from "./type_guard";

export class MentionArgument implements ArgumentTypeGuard {
    type = "mention";

    is_valid_argument(arg: string): boolean {
        const mention_regex = /<@!(\d+)>/;

        return mention_regex.test(arg);
    }
}
