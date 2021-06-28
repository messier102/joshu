import SQL from "sql-template-strings";
import dedent from "ts-dedent";
import { Command } from "../core/command";
import { Parameter } from "../core/parameter";
import { pBoolean } from "../core/parsers/Boolean";
import { optional } from "../core/parsers/optional";
import { ValidatedRequest } from "../core/request";
import { Response } from "../core/response";
import { db_promise } from "../core/services/database";

export default db_promise.then(
    (db) =>
        new Command(
            {
                name: "americanintro",
                description: "Counts uses of American introductions.",

                parameters: [
                    new Parameter({
                        name: "is american intro",
                        parser: optional(pBoolean),
                        description:
                            "Count as an American intro or as a regular intro",
                        examples: ["true", "false"],
                    }),
                ],
                permissions: [],
                owner_only: true,
            },

            async (_: ValidatedRequest, is_american_intro?: boolean) => {
                if (is_american_intro) {
                    await db.query(
                        SQL`UPDATE american_intros
                            SET count = count + 1 
                            WHERE american_intro = ${is_american_intro}`
                    );
                }

                const res = await db.query(
                    SQL`SELECT (
                            SELECT count
                            FROM american_intros 
                            WHERE american_intro = true
                        ) as american_intros_count,
                        (
                            SELECT SUM(count) 
                            FROM american_intros
                        ) as total`
                );

                const { american_intros_count, total } = res.rows[0];

                return Response.Ok(
                    dedent`
                        ${american_intros_count} American intros
                        ${total} total intros
                        ${Math.round((american_intros_count / total) * 100)}%
                    `
                );
            }
        )
);
