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
        const exchange_rate = await fetch_exchange_rate(
            base_currency,
            target_currency
        );

        if (exchange_rate.some) {
            const ex = exchange_rate.val;

            source.channel.send(
                `${humanize(amount)} **${ex.base_currency}** = ` +
                    ` ${humanize(amount * ex.price)} **${ex.target_currency}**`
            );
        } else {
            source.channel.send(`error: couldn't fetch the exchange rate.`);
        }
    },
};
