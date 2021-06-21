import { Command } from "../core/command";
import { Response, ResponseOk } from "../core/response";
import { ValidatedRequest } from "../core/request";
import { translate } from "../core/services/google_translate";
import { LanguageResult } from "@google-cloud/translate/build/src/v2";
import { MessageEmbed } from "discord.js";
import { chunk } from "lodash";
import { OptionalParameter } from "../core/parameter";
import { pString } from "../core/parsers/String";

export default new Command(
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

    async (_: ValidatedRequest, target_language?: string) => {
        const [languages] = await translate.getLanguages();

        if (target_language) {
            const target_language_lowercase = target_language.toLowerCase();

            const match = languages.find(
                (lang) => lang.name.toLowerCase() === target_language_lowercase
            );

            if (match) {
                return Response.Ok(
                    `The language code for **${match.name}** is **${match.code}**`
                );
            } else {
                return Response.Error(
                    `Couldn't find the language: **${target_language}**`
                );
            }
        } else {
            return new TranslateLangsOk(languages);
        }
    }
);

class TranslateLangsOk extends ResponseOk {
    constructor(public readonly languages: LanguageResult[]) {
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
