import { Command } from "../command";
import { CommandHandler } from "./base";

export default class Ping implements CommandHandler {
    can_handle_command(): boolean {
        return true;
    }

    handle_command({ source }: Command): void {
        source.reply("pong!");
    }
}
