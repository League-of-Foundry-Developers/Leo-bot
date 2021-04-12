const { utils } = require("./utils.js");
const { PackageSearch } = require("./classes/PackageSearch.js");
const { ReputationManager } = require("./classes/ReputationManager.js");

/**
 * @typedef {import("discord.js").Client} Client
 * @typedef {import("discord.js").Message} Message
 * @typedef {import("discord.js").MessageReaction} MessageReaction
 * @typedef {import("discord.js").User} User
 * @typedef {import("sequelize").Sequelize} Sequelize
 */

/**
 * The League of Extraordinary Foundry VTT Developers Discord Bot
 *
 * @class Leo
 */
class Leo {
	/**
	 * Creates an instance of Leo.
	 *
	 * @param {LeoConfig} config - The configuration file data for this instance of Leo
	 * @param {Sequelize} sql    - A reference to the sqlite ORM
	 * @param {Client}    client - A reference to the Discord.js client
	 * @memberof Leo
	 */
	constructor(config, sql, client) {
		this.config = config;
		this.sql = sql;
		this.client = client;

		this.reputation = new ReputationManager(this);
		this.packages   = new PackageSearch(this);
	}
	
	/**
	 * Initialize required members and structures for Leo
	 *
	 * @memberof Leo
	 */
	async init() {
		await this.reputation.init();
		await this.packages.init();
		await this.createListeners();
		await this.client.login(this.config.token);
	}

	/**
	 * Wraps fetching the remaining data for a partial Discord.js structure
	 * in a condition and error handling.
	 *
	 * @param {object} data - Some Discord.js object
	 * @return {boolean}      True if the partial was fetches successfully
	 * @memberof Leo
	 */
	async fetchPartial(data) {
		if (data.partial) {
			try { await data.fetch(); } catch (error) {
				console.error(`Something went wrong when fetching partial ${data.id}: `, error);
				return false;
			}
		}
		return true;
	}

	/**
	 * Fires once when the bot is ready.
	 *
	 * @memberof Leo
	 */
	async onReady() {
		console.log("Leo ready!");
	}

	/**
	 * Receives message creation events, and delegates handling them.
	 *
	 * Ignores bots.
	 *
	 * Eats errors.
	 *
	 * @param {Message} message
	 * @return {void} 
	 * @memberof Leo
	 */
	async onMessage(message) {
		if (message.author.bot) return;
		utils.debug(message);
		
		try {
			await Promise.all([
				this.reputation.handleMessage(message)
			]);
		} catch (e) { console.error(e); }
	}

	/**
	 * Receives message reaction creation events, and delegates handling them.
	 *
	 * Eats errors.
	 *
	 * @param {MessageReaction} reaction - The reaction that was created
	 * @param {User}            user     - The user who reacted
	 * @return {void} 
	 * @memberof Leo
	 */
	async onMessageReactionAdd(reaction, user) {
		if (!await this.fetchPartial(reaction)) return;
		utils.debug(reaction, user);

		try{
			await Promise.all([
				this.reputation.handleReaction(reaction, user)
			]);
		} catch(e) { console.error(e); }
	}

	/**
	 * Delegates /slash command interaction handling.
	 *
	 * @param {Interaction} interaction
	 * @memberof Leo
	 */
	async onInteractionCreate(interaction) {
		utils.debug(interaction);

		try {
			await Promise.all([
				this.reputation.handleInteraction(interaction),
				this.packages.handleInteraction(interaction)
			]);
		} catch (e) { console.error(e); }
	}

	/**
	 * Registers the event handlers for this bot
	 *
	 * @memberof Leo
	 */
	async createListeners() {
		this.client.once("ready", this.onReady.bind(this));
		this.client.on("message", this.onMessage.bind(this));
		this.client.on("messageReactionAdd", this.onMessageReactionAdd.bind(this));

		this.client.ws.on('INTERACTION_CREATE', this.onInteractionCreate.bind(this));
	}

	/**
	 * Sends a response to an interaction
	 *
	 * @param {Interaction} interaction
	 * @param {InteractionResponse} data
	 * @memberof Leo
	 */
	async respond(interaction, data) {
		return await this.client.api
			.interactions(interaction.id, interaction.token)
			.callback.post({ data: { type: 4, data: data } });
	}
}

module.exports.Leo = Leo;

/* Leftovers from earlier development not yet re-factored

// A command to make Leo send a message in a certain channel,
// Useless without better permissions system
async function handleSayCommand(interaction) {
	utils.debug(client.channels);
	const channel = interaction.data.options.find(o => o.name == "channel")?.value;
	const message = interaction.data.options.find(o => o.name == "message")?.value;

	utils.debug(`
		Sending message on channel: ${channel}
		> ${message}
	`);

	await client.api.interactions(interaction.id, interaction.token).callback.post({data: {
		type: 4,
		data: {
			content: `Sending message to ${channel}`
		}
	}});

	const ch = await client.channels.fetch(channel);
	ch.send(message);
}*/