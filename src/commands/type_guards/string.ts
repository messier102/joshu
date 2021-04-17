import { ArgumentTypeGuard } from "./type_guard";

export class StringArgument implements ArgumentTypeGuard {
    is_valid_argument(_arg: string): boolean {
        // all command args are valid strings
        return true;
    }
}