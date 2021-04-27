import { ExchangeRate } from ".";
import config from "../../data/config";
import fetch from "node-fetch";
import { Err, Ok, Result } from "ts-results";

type CurrencyConverterResponse = {
    [currency_pair: string]: number;
};

export async function fetch_currency_converter(
    base_currency: string,
    target_currency: string
): Promise<Result<ExchangeRate, void>> {
    base_currency = base_currency.toUpperCase();
    target_currency = target_currency.toUpperCase();

    const currency_pair = `${base_currency}_${target_currency}`;

    const api_endpoint =
        `https://free.currconv.com/api/v7/convert` +
        `?q=${currency_pair}` +
        `&apiKey=${config.currency_converter_api_key}` +
        `&compact=ultra`;

    const response = await fetch(api_endpoint);
    const body: CurrencyConverterResponse = await response.json();

    if (!body[currency_pair]) {
        return Err.EMPTY;
    }

    return Ok({ base_currency, target_currency, price: body[currency_pair] });
}
