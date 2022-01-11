import config from "../data/config";
import { Bot } from "./core/bot";
import { AnyCommand } from "./core/command";

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
// import translate from "./commands/translate";
// import translatelangs from "./commands/translatelangs";

const commands = [
    _8ball,
    ban,
    closegateaux,
    echo,
    gateaux,
    giverole,
    opengateaux,
    ping,
    pruneroles,
    redditrandom,
    say,

    // These depend on an asynchronously initialized client, not sure how to
    // best handle them at this time:
    // translate,
    // translatelangs,
] as AnyCommand[];

const joshu = new Bot(config.prefix, commands);

joshu.run(config.discord_token);
