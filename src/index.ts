import config from "../data/config";
import { Bot } from "./core/bot";
import { AnyCommand } from "./core/command";
import { GoogleTranslateService } from "./core/services/google_translate";

import _8ball from "./commands/8ball";
import ban from "./commands/ban";
import closegateaux from "./commands/closegateaux";
import echo from "./commands/echo";
import gateaux from "./commands/gateaux";
import giverole from "./commands/giverole";
import opengateaux from "./commands/opengateaux";
import ping from "./commands/ping";
import pruneroles from "./commands/pruneroles";
import redditrandom from "./commands/redditrandom";
import say from "./commands/say";
import translate from "./commands/translate";
import translatelangs from "./commands/translatelangs";

async function main() {
    const google_translate_service = await GoogleTranslateService.create();

    const commands = [
        ping,
        echo,
        say,

        ban,

        gateaux,
        opengateaux,
        closegateaux,

        giverole,
        pruneroles,

        _8ball,
        redditrandom,

        translate(google_translate_service),
        translatelangs(google_translate_service),
    ] as AnyCommand[];

    const joshu = new Bot(config.prefix, commands);

    joshu.run(config.discord_token);
}

main();
