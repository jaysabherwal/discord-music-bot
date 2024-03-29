import { Collection } from "discord.js";
import { readdirSync } from "fs";
import { Command, ExecuteArgs } from "./util/models/command";
import logger from "./util/logger";

export class CommandHandler {
    commands: Collection<string, Command>;

    constructor() {
        this.commands = new Collection();
        this.getCommands();
    }

    executeCommand = async ({ interaction, audioHandlers }: ExecuteArgs) => {
        const command = this.commands.get(interaction.commandName);

        if (!command) {
            logger.warn(`Command not found: ${JSON.stringify(command)}`, {
                interactionId: interaction.id,
                userId: interaction.user.id
            });
            interaction.reply('Command not found!');
        }
        
        try {
            logger.info(`Executing command: ${JSON.stringify(command)}`, {
                interactionId: interaction.id
            });
            command.execute({ interaction, audioHandlers });
        } catch (error) {
            logger.error(`Error thrown while executing command`, JSON.stringify(error), `id: ${interaction.id}`);
            interaction.reply({ content: ':sob: There was an error while executing this command', ephemeral: true });
        }
    }

    private getCommands = (): void => {
        const files = readdirSync(`${__dirname}/commands`).filter(file => (file.endsWith('.ts') || file.endsWith('.js')));
        files.forEach(file => {
            const _class = require(`./commands/${file.split(".")[0]}`);
            let command: Command = new _class.default;

            logger.info(`Registered command: ${command.data.name}`);

            this.commands.set(command.data.name, command);
        }); 
    }
}