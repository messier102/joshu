import { CommandRequest } from "../request";
import { CommandParameter, Command } from "../command";
import StringConverter from "../type_converters/StringConverter";
import PositiveNumberConverter from "../type_converters/PositiveNumberConverter";
import { fetch_exchange_rate } from "../../exchange_rate";

function format_decimal(num: number): string {
    // make sure we're properly representing very small fractions
    if (num >= 1) {
        return num.toFixed(4).replace(/\.?0*$/, ""); // strip trailing zeroes
    } else {
        // grab up to 4 significant decimal places
        const match = num.toFixed(20).match(/^0\.0*[1-9]{1,4}/);

        if (match) {
            return match[0];
        } else {
            // stupidly small fraction, fall back to exponential notation
            return num.toString();
        }
    }
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
                `${format_decimal(amount)} **${ex.base_currency}** = ` +
                    `${format_decimal(amount * ex.price)} **${
                        ex.target_currency
                    }**`
            );
        } else {
            source.channel.send(`error: couldn't fetch the exchange rate.`);
        }
    },
};
