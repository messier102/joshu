import { ValidatedCommandRequest } from "../request";
import { CommandParameter, Command } from "../command";
import StringConverter from "../type_converters/StringConverter";
import PositiveNumberConverter from "../type_converters/PositiveNumberConverter";
import { convert_currency } from "../../services/coinmarketcap";
import { CommandResponse } from "../response";

export default Command(
    {
        aliases: ["convert", "conv"],

        parameters: [
            new CommandParameter("base currency", StringConverter),
            new CommandParameter("target currency", StringConverter),
            new CommandParameter("amount", PositiveNumberConverter),
        ],
        permissions: [],
    },

    async (
        _: ValidatedCommandRequest,
        base_currency: string,
        target_currency: string,
        amount: number
    ) => {
        base_currency = base_currency.toUpperCase();
        target_currency = target_currency.toUpperCase();

        const conversion_result = await convert_currency(
            base_currency,
            target_currency,
            amount
        );

        if (conversion_result.ok) {
            const conversion = conversion_result.val;
            const amount_converted = conversion[target_currency].price;

            if (!amount_converted) {
                return CommandResponse.Error(
                    "conversion request was successful, but the API did not return a price.\n" +
                        "(This usually means that the currency had existed in the past, but not anymore.)"
                );
            }

            const message =
                `${format_decimal(amount)} **${base_currency}** = ` +
                `${format_decimal(amount_converted)} **${target_currency}**`;

            return CommandResponse.Ok(message);
        } else {
            const error_message = conversion_result.val;
            return CommandResponse.Error(`API error: ${error_message}.`);
        }
    }
);

/**
 * Formats a floating point number into a human-readable decimal representation
 * with up to 4 significant decimal places, without trailing zeroes.
 *
 * If the number doesn't have a fractional part, returns only the whole part.
 *
 * @param num number to format
 * @returns a string with the decimal representation of `num`
 *
 * @example
 * ```ts
 * format_decimal(1) === "1";
 * format_decimal(1.23) === "1.23";
 * format_decimal(1.23001) === "1.23";
 * format_decimal(1.2345678) === "1.2345";
 * format_decimal(0.000012345678) === "0.00001234";
 * ```
 */
function format_decimal(num: number): string {
    // make sure we're properly representing very small fractions
    if (num >= 1) {
        // ? toFixed defaults to exponential notation for numbers >= 1e+21
        // ? maybe switch to a decimal number library
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
