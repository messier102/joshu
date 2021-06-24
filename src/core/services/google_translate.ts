import {
    LanguageResult,
    Translate,
} from "@google-cloud/translate/build/src/v2";
import config from "../../../data/config";

// As defined here:
// https://cloud.google.com/translate/docs/reference/rest/v2/translate#response-body
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
        private readonly client: Translate,
        // TODO: use a map
        // This is a list and not a map because we sometimes need to get a key
        // by its value. Consider reimplementing as a bidirectional map.
        readonly supported_languages: readonly LanguageResult[]
    ) {}

    static async create(): Promise<GoogleTranslateService> {
        const client = new Translate({
            key: config.google_translation_api_key,
        });

        const [supported_languages, _] = await client.getLanguages();

        return new GoogleTranslateService(client, supported_languages);
    }

    async translate(
        target_language_code: string,
        source_text: string
    ): Promise<GoogleTranslateResponse> {
        // FIXME: error reporting
        // Technically, this API call can fail. Unfortunately, Mr. Google
        // couldn't be arsed to provide any documentation about the error
        // responses, so I'm not exactly sure what I'm supposed to catch here.
        // We can get away with not doing error handling because we perform name
        // resolution before calling this function, so `target_language_code` is
        // always valid, and `source_text` can't be empty thanks to the argument
        // parsing. Still, this *is* a partial function, and for posterity we
        // should add error handling/reporting here.
        const [_, response_any] = await this.client.translate(source_text, {
            to: target_language_code,
        });
        const response: GoogleTranslateApiResponse = response_any;

        const [translation] = response.data.translations;

        // if the API responded with success, we know that the language codes
        // must be in the language list and therefore not null
        const source_language = this.get_language_by_code(
            translation.detectedSourceLanguage
        )?.name as string;

        const target_language = this.get_language_by_code(target_language_code)
            ?.name as string;

        return {
            source_language,
            target_language,
            source_text,
            translated_text: translation.translatedText,
        };
    }

    get_language_by_code(language_code: string): LanguageResult | undefined {
        return this.supported_languages.find(
            (lang) => lang.code.toLowerCase() === language_code.toLowerCase()
        );
    }

    get_language_by_name(language_name: string): LanguageResult | undefined {
        return this.supported_languages.find(
            (lang) => lang.name.toLowerCase() === language_name.toLowerCase()
        );
    }

    resolve_language(
        language_name_or_code: string
    ): LanguageResult | undefined {
        return (
            this.get_language_by_name(language_name_or_code) ??
            this.get_language_by_code(language_name_or_code)
        );
    }
}

export const translate_promise = GoogleTranslateService.create();
