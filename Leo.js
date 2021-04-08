const { Client } = require("discord.js");
const { PackageSearch } = require("./classes/PackageSearch.js");
const { ReputationManager } = require("./classes/ReputationManager.js");

/**
 * @typedef {import("discord.js").Client} Client
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

	async init() {
		await this.reputation.init();
		await this.packages.init();
		await this.createListeners();
		await this.client.login(this.config.token);
	}

	debug(...args) {
		if (!this.config.debug) return;
		console.debug(...args);
	}

	async fetchPartial(data) {
		if (data.partial) {
			try { await data.fetch(); } catch (error) {
				console.error(`Something went wrong when fetching partial ${data.id}: `, error);
				return false;
			}
		}
		return true;
	}

	async onReady() {
		console.log("Leo ready!");
	}
	async onMessage(message) {
		if (message.author.bot) return;
		this.debug(message);
		
		try {
			await Promise.all([
				this.reputation.handleMessage(message)
			]);
		} catch (e) { console.error(e); }
	}
	async onMessageReactionAdd(reaction, user) {
		if (!await this.fetchPartial(reaction)) return;

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
		try {
			await Promise.all([
				this.reputation.handleInteraction(interaction),
				this.packages.handleInteraction(interaction)
			]);
		} catch (e) { console.error(e); }
	}

	async createListeners() {
		this.client.once("ready", this.onReady.bind(this));
		this.client.on("message", this.onMessage.bind(this));
		this.client.on("messageReactionAdd", this.onMessageReactionAdd.bind(this));

		this.client.ws.on('INTERACTION_CREATE', this.onInteractionCreate.bind(this));
	}

	async respond(interaction, data) {
		return await this.client.api
			.interactions(interaction.id, interaction.token)
			.callback.post({ data: { type: 4, data: data } });
	}
}

module.exports.Leo = Leo;

/* Leftovers from earlier development not yet re-factored
async function handleSayCommand(interaction) {
	console.log(client.channels);
	const channel = interaction.data.options.find(o => o.name == "channel")?.value;
	const message = interaction.data.options.find(o => o.name == "message")?.value;

	console.log(`
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