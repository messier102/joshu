import { CommandHandler } from "../router";

const ping: CommandHandler = ({ source }) => {
    source.reply("pong!");
};

export default ping;
