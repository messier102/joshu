import { fetch_cryptonator } from "./cryptonator";
import { fetch_currency_converter } from "./currency_converter";

export type ExchangeRate = {
    base_currency: string;
    target_currency: string;
    price: number;
};

export async function fetch_exchange_rate(
    base_currency: string,
    target_currency: string
): Promise<ExchangeRate> {
    // TODO: implement handling pairs that aren't natively supported by either of the APIs
    // e.g. ETH -> RSD by combining ETH -> USD and USD -> RSD
    try {
        return await fetch_currency_converter(base_currency, target_currency);
    } catch (e) {
        return await fetch_cryptonator(base_currency, target_currency);
    }
}
