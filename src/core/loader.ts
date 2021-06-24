import { AnyCommand } from "./command";
import path from "path";
import fs from "fs/promises";

export async function load_commands(
    commands_dir: string
): Promise<AnyCommand[]> {
    const filenames = await fs.readdir(commands_dir);

    const command_promises = filenames.map(async (filename) => {
        const command_file = path.join(commands_dir, filename);
        const command_module = await import(command_file);
        const command: AnyCommand = await Promise.resolve(
            command_module.default
        );

        return command;
    });

    return Promise.all(command_promises);
}
