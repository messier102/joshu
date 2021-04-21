import path from "path";
import fs from "fs/promises";
import { CommandRequest } from "./request";
import { Command } from "./command";
import { CommandRecipe } from "./recipe";

export class CommandRouter {
    private readonly command_handlers: Map<string, Command> = new Map();

    constructor() {
        this.load_handlers();
    }

    private async load_handlers(): Promise<void> {
        const recipes_dir = path.join(__dirname, "recipes");
        const filenames = await fs.readdir(recipes_dir);

        for (const filename of filenames) {
            const recipe_file = path.join(recipes_dir, filename);
            const recipe_module = await import(recipe_file);
            const recipe: CommandRecipe = recipe_module.default;

            const command_name = filename.split(".")[0];

            this.command_handlers.set(command_name, new Command(recipe));
        }

        console.log("Loaded commands:");
        console.log(this.command_handlers);
    }

    route_to_handler(request: CommandRequest): void {
        const command_handler = this.command_handlers.get(request.name);

        if (command_handler) {
            command_handler.execute(request, request.args);
        } else {
            request.source.reply("sorry, no such command.");
        }
    }
}
