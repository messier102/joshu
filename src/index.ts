import path from "path";
import { Bot } from "./core/bot";
import config from "../data/config";
import { load_commands } from "./core/loader";

(async () => {
    const commands_dir = path.join(__dirname, "commands");
    const commands = await load_commands(commands_dir);

    const joshu = new Bot(config.prefix, commands);

    joshu.run(config.discord_token);
})();
