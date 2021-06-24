import { v2 } from "@google-cloud/translate";
import config from "../../../data/config";

class GoogleTranslateService {
    private constructor(
        readonly client: v2.Translate,
        readonly supported_languages: readonly v2.LanguageResult[]
    ) {}

    static async create(): Promise<GoogleTranslateService> {
        const client = new v2.Translate({
            key: config.google_translation_api_key,
        });

        const [supported_languages] = await client.getLanguages();

        return new GoogleTranslateService(client, supported_languages);
    }
}

export const translate_promise = GoogleTranslateService.create();
