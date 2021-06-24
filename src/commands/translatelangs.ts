import { Command } from "../core/command";
import { Response, ResponseOk } from "../core/response";
import { ValidatedRequest } from "../core/request";
import { translate_promise } from "../core/services/google_translate";
import { LanguageResult } from "@google-cloud/translate/build/src/v2";
import { MessageEmbed } from "discord.js";
import { chunk } from "lodash";
import { OptionalParameter } from "../core/parameter";
import { pString } from "../core/parsers/String";

export default translate_promise.then((translate) => {
    return new Command(
        {
            name: "translatelangs",
            description:
                "Looks up the ISO language code for a given language." +
                " If no language is provided, displays all available languages with their codes.",
            aliases: ["tllangs"],

            parameters: [
                new OptionalParameter({
                    name: "target language",
                    parser: pString,
                    description:
                        "The language to find the ISO code for, case-insensitive.",
                    examples: ["English", "French", "Japanese"],
                }),
            ],
            permissions: [],
        },

        async (_: ValidatedRequest, target_language_name?: string) => {
            if (target_language_name) {
                const language = translate.get_language_by_name(
                    target_language_name
                );

                if (language) {
                    return Response.Ok(
                        `The language code for **${language.name}** is **${language.code}**`
                    );
                } else {
                    return Response.Error(
                        `Language not recognized: **${target_language_name}**`
                    );
                }
            } else {
                return new TranslateLangsOk(translate.supported_languages);
            }
        }
    );
});

class TranslateLangsOk extends ResponseOk {
    constructor(public readonly languages: readonly LanguageResult[]) {
        super();
    }

    to_embed(): MessageEmbed {
        const column_length = Math.ceil(this.languages.length / 3);
        const langs_formatted = this.languages.map(
            (lang) => `${lang.code}: ${lang.name}`
        );

        const columns = chunk(langs_formatted, column_length);

        return super
            .to_embed()
            .setTitle("Available languages")
            .addFields(
                columns.map((langs) => ({
                    name: "\u200b",
                    value: langs.join("\n"),
                    inline: true,
                }))
            );
    }
}
