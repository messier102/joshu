export interface ArgumentTypeGuard {
    type: string;

    is_valid_argument(arg: string): boolean;
}
