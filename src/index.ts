import path from "node:path";
import { Joshu } from "./core/joshu";
import config from "../data/config";

(async () => {
    const commands_dir = path.join(__dirname, "commands");
    const joshu = await Joshu.with(config.prefix, commands_dir);

    joshu.run(config.discord_token);
})();
