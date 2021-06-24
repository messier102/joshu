import { Command } from "../core/command";
import { ResponseOk } from "../core/response";
import { Parameter } from "../core/parameter";
import { pString } from "../core/parsers/String";
import { ValidatedRequest } from "../core/request";
import { translate_promise } from "../core/services/google_translate";
import { MessageEmbed } from "discord.js";

export default translate_promise.then((translate) => {
    return new Command(
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
            const translation = await translate.translate(
                target_language_code,
                source_text
            );

            return new TranslateOk(
                translation.source_language,
                translation.target_language,
                translation.source_text,
                translation.translated_text
            );
        }
    );
});

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
