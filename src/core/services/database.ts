import { Client } from "pg";
import config from "../../../data/config";

const client = new Client(config.postgres_credentials);

export const db_promise = (async (): Promise<Client> => {
    await client.connect();
    return client;
})();
