import config from "../data/config";
import { Bot } from "./core/bot";
import { AnyCommand } from "./core/command";
import { GoogleTranslateService } from "./core/services/google_translate";
import RedditClient from "snoots";

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
    const google_translate_service = await GoogleTranslateService.create(
        config.google_translation_api_key
    );
    const reddit_service = new RedditClient(config.reddit.client);

    const commands = [
        ping,
        echo,
        say,

        ban,

        gateaux(reddit_service),
        opengateaux(reddit_service),
        closegateaux(reddit_service),

        giverole,
        pruneroles,

        _8ball,
        redditrandom(reddit_service),

        translate(google_translate_service),
        translatelangs(google_translate_service),
    ] as AnyCommand[]; // TODO: type safety

    const joshu = new Bot(config.prefix, commands);

    joshu.run(config.discord_token);
}

main();
