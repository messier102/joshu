import { v2 } from "@google-cloud/translate";
import config from "../../../data/config";

export const translate = new v2.Translate({
    key: config.google_translation_api_key,
});
