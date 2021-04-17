import { ArgumentTypeGuard } from "./type_guard";

export class MentionArgument implements ArgumentTypeGuard {
    is_valid_argument(arg: string): boolean {
        const mention_regex = /<@!(\d+)>/;

        return mention_regex.test(arg);
    }
}
