import { Err, Ok, Result } from "ts-results";
import config from "../../data/config";
import axios from "axios";

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

const COINMARKETCAP_API = axios.create({
    baseURL: `https://${config.cmc_domain}/`,
    headers: {
        "X-CMC_PRO_API_KEY": config.cmc_api_key,
    },

    // API always responds with a JSON status object regardless of the HTTP code
    validateStatus: () => true,
});

/**
 * See API documentation at
 * https://coinmarketcap.com/api/documentation/v1/#operation/getV1ToolsPriceconversion
 */
export async function convert_currency(
    base_currency: string,
    target_currency: string,
    amount: number
): Promise<Result<Conversions, string>> {
    const response = await COINMARKETCAP_API.get<CoinMarketCapResponse>(
        "/v1/tools/price-conversion",
        {
            params: {
                symbol: base_currency,
                convert: target_currency,
                amount,
            },
        }
    );
    const json = response.data;

    if (json.data) {
        return Ok(json.data.quote);
    } else {
        return Err(json.status.error_message);
    }
}
