import path from "path";
import { Bot } from "./core/bot";
import config from "../data/config";

(async () => {
    const commands_dir = path.join(__dirname, "commands");
    const joshu = await Bot.with(config.prefix, commands_dir);

    joshu.run(config.discord_token);
})();
