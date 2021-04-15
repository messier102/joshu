import { CommandHandler } from "../dispatch";

const ping: CommandHandler = ({ source }) => {
    source.reply("pong!");
};

export default ping;
