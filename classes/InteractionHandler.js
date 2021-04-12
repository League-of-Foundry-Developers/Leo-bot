/**
 * An abstract class for mechanisms that handle Discord interaction
 * /slash commands and delegate subcommands to specific moethods.
 *
 * @class InteractionHandler
 */
export default class InteractionHandler {
	/**
	 * Extracts the options from a command into a key:value pair.
	 *
	 * @param {InteractionData|InteractionOption} command - The command data or subcommand to extract options from
	 * @return {Object<string,any>}                         The key:value object of each option and its value 
	 * @memberof ReputationManager
	 */
	static extractOptions(command) {
		if (!command.options) return null;
		return command.options.reduce((options, option) => {
			options[option.name] = option.value;
			return options;
		}, {});
	}

	/** @readonly @type {number} "Ephemeral" response flag, only the command issuer can see the response */
	static get ephemeral() { return 64; }

	/**
	 * Creates an instance of InteractionHandler.
	 *
	 * @param {import("../Leo.js").Leo} bot
	 * @memberof InteractionHandler
	 */
	constructor(bot) {
		this.bot = bot;
	}

	get config() { return this.bot.config; }
	get client() { return this.bot.client; }
	get sql()    { return this.bot.sql;    }

	/**
	 * The name of the /slash command that this class handles
	 * 
	 * @override
	 * @readonly
	 * @memberof InteractionHandler
	 */
	get commandName() { return ""; }

	/**
	 * Handles /slash command interactions for a command.
	 *
	 * Delegates the interaction to the appropriate subcommand if applicable,
	 * a method with the form of subnameCommand(Interaction, subcommandOptions).
	 *
	 * If no subcommands are used, delegates handling to {@see this#command}
	 *
	 * @param {Interaction} interaction - Information about the interaction
	 * @return {Promise<object>}          The response object
	 * @memberof ReputationManager
	 */
	async handleInteraction(interaction) {
		if (interaction.data.name != this.commandName) return;

		const sub = interaction.data.options.find(o => o.type == 1);

		if (!sub) return await this.command(
			interaction,
			InteractionHandler.extractOptions(interaction.data)
		);

		const handler = `${sub.name}Command`;
		if (this[handler]) return await this[handler](
			interaction,
			InteractionHandler.extractOptions(sub)
		);
	}
}