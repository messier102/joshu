import { ArgumentTypeGuard } from "./type_guard";

export class SnowflakeArgument implements ArgumentTypeGuard {
    type = "snowflake";

    is_valid_argument(arg: string): boolean {
        // discord snowflakes are at least 17 digits long
        // see https://archive.md/nvaQA
        const snowflake_regex = /^\d{17,}$/;

        return snowflake_regex.test(arg);
    }
}