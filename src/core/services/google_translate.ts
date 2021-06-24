import { v2 } from "@google-cloud/translate";
import config from "../../../data/config";

type GoogleTranslateApiResponse = {
    data: {
        translations: {
            detectedSourceLanguage: string;
            model?: string;
            translatedText: string;
        }[];
    };
};

type GoogleTranslateResponse = {
    source_language: string;
    target_language: string;
    source_text: string;
    translated_text: string;
};

class GoogleTranslateService {
    private constructor(
        readonly client: v2.Translate,
        // This is a list and not a map because we sometimes need to get a key
        // by its value. Consider reimplementing as a bidirectional map.
        readonly supported_languages: readonly v2.LanguageResult[]
    ) {}

    static async create(): Promise<GoogleTranslateService> {
        const client = new v2.Translate({
            key: config.google_translation_api_key,
        });

        const [supported_languages] = await client.getLanguages();

        return new GoogleTranslateService(client, supported_languages);
    }

    async translate(
        target_language_code: string,
        source_text: string
    ): Promise<GoogleTranslateResponse> {
        const [_, response_any] = await this.client.translate(source_text, {
            to: target_language_code,
        });
        const response: GoogleTranslateApiResponse = response_any;

        const translation = response.data.translations[0];

        // if the API responded success, we know that the language codes must be
        // in the language list and therefore not null
        const source_language = this.supported_languages.find(
            (lang) => lang.code === translation.detectedSourceLanguage
        )?.name as string;
        const target_language = this.supported_languages.find(
            (lang) => lang.code === target_language_code
        )?.name as string;

        return {
            source_language,
            target_language,
            source_text,
            translated_text: translation.translatedText,
        };
    }
}

export const translate_promise = GoogleTranslateService.create();
