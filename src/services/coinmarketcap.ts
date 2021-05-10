import fetch from "node-fetch";
import { Err, Ok, Result } from "ts-results";
import config from "../../data/config";

type Conversions = {
    [key: string]: {
        price: number;
        last_updated: string;
    };
};

type CoinMarketCapResponse = {
    status: {
        timestamp: string;
        error_code: number;
        error_message: string;
        elapsed: number;
        credit_count: number;
    };

    data?: {
        id: number;
        name: string;
        symbol: string;
        amount: string;
        last_updated: string;
        quote: Conversions;
    };
};

export async function convert_currency(
    base_currency: string,
    target_currency: string,
    amount: number
): Promise<Result<Conversions, string>> {
    const api_endpoint =
        `https://${config.cmc_domain}/v1/tools/price-conversion?` +
        `symbol=${base_currency}&` +
        `convert=${target_currency}&` +
        `amount=${amount}`;

    const response = await fetch(api_endpoint, {
        headers: {
            "X-CMC_PRO_API_KEY": config.cmc_api_key,
        },
    });
    const body: CoinMarketCapResponse = await response.json();

    if (response.ok && body.data) {
        return Ok(body.data.quote);
    } else {
        return Err(body.status.error_message);
    }
}
