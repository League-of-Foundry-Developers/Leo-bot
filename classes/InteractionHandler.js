/**
 * @typedef {import("discord.js").Client} Client
 * @typedef {import("sequelize").Sequelize} Sequelize
 */

import Utils from "../utils.js";

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

	/** @type    { LeoConfig } */
	get config() { return this.bot.config; }
	/** @type    { Client   }    */
	get client() { return this.bot.client; }
	/** @type    { Sequelize} */
	get sql()    { return this.bot.sql; }

	/**
	 * The name of the /slash command that this class handles
	 * 
	 * @override
	 * @readonly
	 * @memberof InteractionHandler
	 */
	get commandName() { return ""; }

	get componentNames() { return []; }

	/**
	 * Handles interactions for an application.
	 *
	 * Delegates the interaction to a command or message component handler.
	 *
	 * @param {Interaction} interaction - Information about the interaction
	 * @return {Promise<object>}          The response object
	 * @memberof ReputationManager
	 */
	async handleInteraction(interaction) {
		switch(interaction.type) {
			case 1: return Utils.debug("Received Ping");
			case 2: return await this.handleApplicationCommand(interaction);
			case 3: return await this.handleMessageComponent(interaction);
		}
	}
	/**
	 * Handles /slash command interactions for a command.
	 *
	 * Delegates the interaction to the appropriate subcommand if applicable,
	 * a method with the form of subnameCommand(Interaction, subcommandOptions).
	 *
	 * If no subcommands are used, delegates handling to {@see this#command}
	 *
	 * @param {*} interaction
	 * @return {*} 
	 * @memberof InteractionHandler
	 */
	async handleApplicationCommand(interaction) {
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

	/**
	 * Handles message componenet interactions, delegating the
	 * handling to a method that matches the custom_id of the
	 * component.
	 *
	 * @param {*} interaction
	 * @return {*} 
	 * @memberof InteractionHandler
	 */
	async handleMessageComponent(interaction) {
		let data = {};
		try {
			data = JSON.parse(interaction.data.content);
		}
		catch (e) {
			data = { name: null };
		}
		
		if (!this.componentNames.includes(data.name)) return;

		const handler = `${data.name}Component`;
		if (this[handler]) return await this[handler](interaction, data);
	}
}

/**
 * An alternative abstraction for interactions using the Discord.js v13 methods.
 */
export class DjsInteractionHandler extends InteractionHandler {
	async init() {
		await this.initCommands();
	}

	async handleInteraction(interaction) {
		switch (interaction.type) {
			case 'APPLICATION_COMMAND': return await this.handleApplicationCommand(interaction);
			case 'MESSAGE_COMPONENT': return await this.handleMessageComponent(interaction);
		}
	}
	
	async handleApplicationCommand(interaction) {
		if (interaction.commandName !== this.commandName) return;

		const sub = interaction.options.find(o => o.type == 'SUB_COMMAND');

		if (!sub) return await this.command(
			interaction, interaction.options
		);

		const handler = `${sub.name}Command`;
		if (this[handler]) return await this[handler](
			interaction, sub.options
		);
	}

	async handleMessageComponent(interaction) {
		let data = {};
		try {
			data = JSON.parse(interaction.customId);
		}
		catch (e) {
			data = { name: null };
		}

		if (!this.componentNames.includes(data.name)) return;

		data.values = interaction.values;

		const handler = `${data.name}Component`;
		if (this[handler]) return await this[handler](interaction, data);
	}
}