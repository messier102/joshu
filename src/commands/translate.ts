import { Command } from "../core/command";
import { ResponseOk } from "../core/response";
import { Parameter } from "../core/parameter";
import { pString } from "../core/parsers/String";
import { ValidatedRequest } from "../core/request";
import { translate } from "../core/services/google_translate";
import { MessageEmbed } from "discord.js";

export default new Command(
    {
        name: "translate",
        description: "Translates text to a specified language.",
        aliases: ["tl"],

        parameters: [
            new Parameter({
                name: "target language code",
                parser: pString,
                description:
                    "The ISO code of the language to translate into." +
                    " [See all available languages.](https://cloud.google.com/translate/docs/languages)",
                examples: ["en", "ru", "ja", "fr", "de"],
            }),
            new Parameter({
                name: "source text",
                parser: pString,
                description: "The text to translate.",
                examples: ["Jajajaja mi amor donde estas holaaaaaa"],
            }),
        ],
        permissions: [],

        accept_remainder_arg: true,
    },

    async (
        _: ValidatedRequest,
        target_language_code: string,
        source_text: string
    ) => {
        const [translated_text, metadata] = await translate.translate(
            source_text,
            target_language_code
        );

        // `metadata` holds the entire API response body, as defined here:
        // https://cloud.google.com/translate/docs/reference/rest/v2/translate#response-body
        // Thanks for typing it as `any`, Google. :/
        const detected_source_language_code =
            metadata.data.translations[0].detectedSourceLanguage;

        const [languages] = await translate.getLanguages();
        const source_language = languages.find(
            (lang) => lang.code === detected_source_language_code
        )?.name;
        const target_language = languages.find(
            (lang) => lang.code === target_language_code
        )?.name;

        return new TranslateOk(
            source_language as string,
            target_language as string,
            source_text,
            translated_text
        );
    }
);

class TranslateOk extends ResponseOk {
    constructor(
        public readonly source_language: string,
        public readonly target_language: string,
        public readonly source_text: string,
        public readonly translated_text: string
    ) {
        super();
    }

    to_embed(): MessageEmbed {
        return super
            .to_embed()
            .addField(
                // two spaces because it looks a bit smushed otherwise
                `📥  ${this.source_language} (detected)`,
                this.source_text
            )
            .addField(`📤  ${this.target_language}`, this.translated_text)
            .setFooter("Translated via Google Translate");
    }
}
