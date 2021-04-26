import fetch from "node-fetch";

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

export type ExchangeRate = {
    base_currency: string;
    target_currency: string;
    price: number;
};

export async function fetch_exchange_rate(
    base_currency: string,
    target_currency: string
): Promise<ExchangeRate> {
    const api_endpoint = `https://api.cryptonator.com/api/ticker/${base_currency}-${target_currency}`;
    const response = await fetch(api_endpoint);
    const body: CryptonatorResponse = await response.json();

    if (!body.success) {
        throw new Error(body.error);
    }

    return {
        base_currency: body.ticker.base,
        target_currency: body.ticker.target,
        price: Number.parseFloat(body.ticker.price),
    };
}
