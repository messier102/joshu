import { Command } from "../command";
import { CommandHandler } from "../handler";

export default class Echo implements CommandHandler {
    can_handle_command(): boolean {
        return true;
    }

    handle_command({ source, args }: Command): void {
        source.channel.send(args.join(" "));
    }
}
