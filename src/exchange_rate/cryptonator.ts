import fetch from "node-fetch";
import { Err, Ok, Result } from "ts-results";
import { ExchangeRate } from ".";

type CryptonatorResponse = {
    ticker: {
        base: string;
        target: string;
        price: string;
        volume: string;
        change: string;
    };
    timestamp: number;
    success: boolean;
    error: string;
};

export async function fetch_cryptonator(
    base_currency: string,
    target_currency: string
): Promise<Result<ExchangeRate, string>> {
    const api_endpoint = `https://api.cryptonator.com/api/ticker/${base_currency}-${target_currency}`;
    const response = await fetch(api_endpoint);
    const body: CryptonatorResponse = await response.json();

    if (!body.success) {
        return Err(body.error);
    }

    return Ok({
        base_currency: body.ticker.base,
        target_currency: body.ticker.target,
        price: Number.parseFloat(body.ticker.price),
    });
}
