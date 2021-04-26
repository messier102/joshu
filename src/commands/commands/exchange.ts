import { CommandRequest } from "../request";
import { CommandParameter, Command } from "../command";
import StringConverter from "../type_converters/StringConverter";
import PositiveNumberConverter from "../type_converters/PositiveNumberConverter";
import { fetch_exchange_rate } from "../../exchange_rate";

function humanize(num: number) {
    return num.toFixed(4).replace(/\.?0*$/, "");
}

export default <Command>{
    aliases: ["convert", "conv"],

    parameters: [
        new CommandParameter("base currency", StringConverter),
        new CommandParameter("target currency", StringConverter),
        new CommandParameter("amount", PositiveNumberConverter),
    ],
    permissions: [],

    async execute(
        { source }: CommandRequest,
        base_currency: string,
        target_currency: string,
        amount: number
    ): Promise<void> {
        source.channel.startTyping();

        try {
            const exchange_rate = await fetch_exchange_rate(
                base_currency,
                target_currency
            );

            source.channel.send(
                `${humanize(amount)} **${
                    exchange_rate.base_currency
                }** = ${humanize(amount * exchange_rate.price)} **${
                    exchange_rate.target_currency
                }**`
            );
        } catch (e) {
            source.channel.send(`error: ${(e as Error).message}`);
        } finally {
            source.channel.stopTyping();
        }
    },
};
