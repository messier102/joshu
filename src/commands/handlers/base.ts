import { Command } from "../command";

export interface CommandHandler {
    can_handle_command(command: Command): boolean;
    handle_command(command: Command): void;
}
